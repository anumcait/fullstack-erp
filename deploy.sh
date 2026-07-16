#!/usr/bin/env bash
#
# deploy.sh — One-command ERP demo deployment automation.
#
# Flow:
#   backup  : dump local Docker DBs (hrdb, erpdb) -> pg_backup/ -> git commit + push dev
#   up      : terraform apply (spin up EC2 + docker stack) and wait until the app is live
#   down    : terraform destroy (tear down, stop billing; data stays in pg_backup/)
#   status  : check app health + print URL
#   all     : backup  ->  up   (default when run with no args)
#
# Run on the machine that has (a) Docker with the local stack running and
# (b) AWS + Terraform configured. On Windows use Git Bash / WSL.
#
set -euo pipefail

# ─────────────── CONFIG (override via env vars) ───────────────
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TF_DIR="$REPO_ROOT/terraform"
BRANCH="${DEPLOY_BRANCH:-dev}"
LOCAL_DB_CONTAINER="${LOCAL_DB_CONTAINER:-hr_postgres}"
AWS_PROFILE="${AWS_PROFILE:-default}"
AWS_REGION="${AWS_REGION:-us-east-1}"
TF_AUTO="${TF_AUTO:-auto-approve}"
POLL_TIMEOUT="${POLL_TIMEOUT:-1200}"  # seconds to wait for the app to come up
POLL_INTERVAL="${POLL_INTERVAL:-15}"

# ─────────────── HELPERS ───────────────
log()  { printf '\033[1;34m[deploy]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m %s\n' "$*" >&2; }
err()  { printf '\033[1;31m[error]\033[0m %s\n' "$*" >&2; }
die()  { err "$*"; exit 1; }

require() { command -v "$1" >/dev/null 2>&1 || die "required tool '$1' not found in PATH"; }

run_tf() {
  ( cd "$TF_DIR" && AWS_PROFILE="$AWS_PROFILE" AWS_REGION="$AWS_REGION" terraform "$@" )
}

# Run a list of shell commands on an EC2 instance via SSM (no SSH key needed).
# $1 = instance id, $2 = JSON array string of commands.
# Commands pipe through `LC_ALL=C sed 's/[^[:print:]]//g'` on the instance side
# so Windows' charset never chokes on bullets/arrows/progress-bar glyphs.
# Uses a proper JSON-object --parameters so it works from Git Bash (the intended
# runner). Prints the command output once the invocation finishes.
_ssm_exec() {
  local id="$1" arr="$2" params cmd_id out=""
  params="{\"commands\":$arr}"
  cmd_id="$(aws ssm send-command \
      --profile "$AWS_PROFILE" --region "$AWS_REGION" \
      --instance-id "$id" --document-name "AWS-RunShellScript" \
      --parameters "$params" \
      --output text --query "Command.CommandId" 2>/dev/null || true)"
  [ -n "$cmd_id" ] || { warn "SSM send-command failed (is the SSM agent/role attached?)."; return 1; }
  out=""
  for _ in $(seq 1 40); do
    out="$(aws ssm get-command-invocation \
        --profile "$AWS_PROFILE" --region "$AWS_REGION" \
        --command-id "$cmd_id" --instance-id "$id" \
        --output text --query "StandardOutputContent" 2>/dev/null || true)"
    [ -n "$out" ] && break
    sleep 5
  done
  printf '%s\n' "$out"
}

# Pull a diagnostic snapshot from the EC2 instance via SSM (no SSH key needed).
ssm_diag() {
  local id arr
  id="$(run_tf output -raw instance_id 2>/dev/null || true)"
  [ -n "$id" ] || { warn "Cannot read instance_id from terraform output (has the stack been applied?)."; return 1; }
  log "Fetching EC2 diagnostics (instance $id) via SSM ..."
  arr=$(cat <<'JSON'
["echo ===BOOTSTRAP===; tail -n 50 /var/log/erp-bootstrap.log 2>/dev/null | LC_ALL=C sed 's/[^[:print:]]//g'","echo ===DOCKER===; docker ps -a 2>/dev/null","echo ===SVC===; systemctl is-active erp-demo.service; systemctl show erp-demo.service -p SubState -p Result","echo ===REPO===; ls /opt/erp-app 2>&1 | head -20 | LC_ALL=C sed 's/[^[:print:]]//g'","echo ===CLONE===; git ls-remote https://github.com/anumcait/fullstack-erp.git 2>&1 | head -3 | LC_ALL=C sed 's/[^[:print:]]//g'"]
JSON
)
  _ssm_exec "$id" "$arr"
}

# Early signal: after a short settle, confirm the repo cloned and bootstrap
# didn't hit a FATAL. Returns 0 if healthy, 1 if a clear failure is detected.
early_check() {
  local id arr out
  id="$(run_tf output -raw instance_id 2>/dev/null || true)"
  [ -n "$id" ] || return 0   # can't check; let the health poll decide
  arr='["if [ -d /opt/erp-app/.git ]; then echo CLONED_OK; else echo CLONE_MISSING; fi; grep -q FATAL /var/log/erp-bootstrap.log 2>/dev/null && echo BOOT_FATAL"]'
  out="$(_ssm_exec "$id" "$arr")"
  case "$out" in
    *BOOT_FATAL*|*CLONE_MISSING*) return 1 ;;
    *) return 0 ;;
  esac
}

# Run an SSM command list (JSON array string in $2) on instance $1 and print output.
ssm_run() { _ssm_exec "$1" "$2"; }

# ─────────────── BACKUP ───────────────
do_backup() {
  log "Backing up local databases from container '$LOCAL_DB_CONTAINER'"

  if ! docker ps --format '{{.Names}}' | grep -qx "$LOCAL_DB_CONTAINER"; then
    warn "Container '$LOCAL_DB_CONTAINER' is not running. Using committed pg_backup/ as-is."
  else
    log "Dumping hrdb ..."
    MSYS_NO_PATHCONV=1 docker exec -t "$LOCAL_DB_CONTAINER" \
      pg_dump -U postgres -Fc -f /pg_backup/hrdb.backup hrdb
    log "Dumping erpdb ..."
    MSYS_NO_PATHCONV=1 docker exec -t "$LOCAL_DB_CONTAINER" \
      pg_dump -U postgres -Fc -f /pg_backup/erpdb.backup erpdb

    # Copy out of the container to the repo's tracked folder.
    TMP="$(mktemp -d)"
    MSYS_NO_PATHCONV=1 docker cp "$LOCAL_DB_CONTAINER:/pg_backup/hrdb.backup"  "$TMP/hrdb.backup"
    MSYS_NO_PATHCONV=1 docker cp "$LOCAL_DB_CONTAINER:/pg_backup/erpdb.backup" "$TMP/erpdb.backup"
    mkdir -p "$REPO_ROOT/pg_backup"
    cp "$TMP/hrdb.backup"  "$REPO_ROOT/pg_backup/hrdb.backup"
    cp "$TMP/erpdb.backup" "$REPO_ROOT/pg_backup/erpdb.backup"
    rm -rf "$TMP"
    log "Backups written to pg_backup/"
  fi

  # Commit + push the latest data so a fresh deploy restores it.
  ( cd "$REPO_ROOT"
    git checkout "$BRANCH" 2>/dev/null || true
    git add pg_backup/
    if git diff --cached --quiet; then
      log "No backup changes to commit."
    else
      git commit -m "chore: update demo DB backups ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
      log "Pushing to origin/$BRANCH ..."
      git push origin "$BRANCH"
    fi
  )
  log "Backup step complete."
}

# ─────────────── UP (apply) ───────────────
do_up() {
  require terraform
  require aws
  log "Initialising Terraform ..."
  run_tf init -upgrade

  log "Applying infrastructure (this builds EC2 + docker stack) ..."
  run_tf apply "-${TF_AUTO}"

  local url
  url="$(run_tf output -raw app_url 2>/dev/null || true)"
  [ -n "$url" ] || die "Could not read app_url from terraform output."
  log "Elastic IP allocated: $url"

  # Fast failure path: confirm the repo cloned within ~3 min so a broken
  # bootstrap surfaces quickly instead of after the full health timeout.
  log "Waiting 180s for first-boot bootstrap, then checking clone status ..."
  sleep 180
  if ! early_check; then
    warn "Bootstrap reported a clone failure (or FATAL in user-data)."
    ssm_diag || true
    return 1
  fi
  log "Bootstrap looks healthy so far; continuing to wait for the app ..."

  log "Waiting up to ${POLL_TIMEOUT}s for the app to become healthy ..."
  local elapsed=0
  until curl -fsS --max-time 10 "$url/api/company-settings" >/dev/null 2>&1; do
    if [ "$elapsed" -ge "$POLL_TIMEOUT" ]; then
      warn "Timed out waiting for health check."
      ssm_diag || true
      return 1
    fi
    printf '.'
    sleep "$POLL_INTERVAL"; elapsed=$((elapsed + POLL_INTERVAL))
  done
  printf '\n'

  log "=========================================================="
  log " ERP demo is LIVE"
  log "   URL : $url"
  log "   Login: 1002 / AUCTOR"
  log "=========================================================="
}

# ─────────────── DOWN (destroy) ───────────────
do_down() {
  require terraform
  log "Destroying infrastructure (data is preserved in pg_backup/) ..."
  run_tf destroy "-${TF_AUTO}"
  log "Tear-down complete. No compute cost continues."
}

# ─────────────── STATUS ───────────────
do_status() {
  local url
  url="$(run_tf output -raw app_url 2>/dev/null || true)"
  [ -n "$url" ] || { warn "No app_url (stack may be destroyed)."; return 1; }
  if curl -fsS --max-time 10 "$url/api/company-settings" >/dev/null 2>&1; then
    log "App healthy: $url"
  else
    warn "App not responding: $url"
  fi
}

# ─────────────── STOP (pause instance, keep resources) ───────────────
do_stop() {
  require aws
  local id
  id="$(run_tf output -raw instance_id 2>/dev/null || true)"
  [ -n "$id" ] || die "Cannot read instance_id (is the stack applied?)."
  log "Stopping EC2 instance $id (compute billing stops; EBS volume + EIP persist) ..."
  aws ec2 stop-instances --instance-ids "$id" \
      --region "$AWS_REGION" --profile "$AWS_PROFILE" >/dev/null 2>&1
  log "Instance stopped. App at $(run_tf output -raw app_url 2>/dev/null) is offline."
  log "To resume: ./deploy.sh start   (systemd auto-restarts Docker + the ERP stack)."
}

# ─────────────── START (resume a stopped instance) ───────────────────
do_start() {
  require aws
  local id
  id="$(run_tf output -raw instance_id 2>/dev/null || true)"
  [ -n "$id" ] || die "Cannot read instance_id (is the stack applied?)."
  log "Starting EC2 instance $id ..."
  aws ec2 start-instances --instance-ids "$id" \
      --region "$AWS_REGION" --profile "$AWS_PROFILE" >/dev/null 2>&1
  log "Instance starting. systemd brings Docker + the ERP stack back up (~1-2 min)."
  log "Then verify: $(run_tf output -raw app_url 2>/dev/null)  (run ./deploy.sh status)."
}

# ─────────────── UPDATE (sync local -> cloud, no terraform rebuild) ───────────────
do_update() {
  require git; require aws

  # 1) Commit + push local changes so the cloud instance can pull them.
  ( cd "$REPO_ROOT"
    git checkout "$BRANCH" 2>/dev/null || true
    if [ -n "$(git status --porcelain)" ]; then
      log "Committing local changes ..."
      git add -A
      git commit -m "chore: local changes for cloud apply ($(date -u +%Y-%m-%dT%H:%M:%SZ))"
    else
      log "No local changes to commit."
    fi
    log "Pushing to origin/$BRANCH ..."
    git push -u origin "$BRANCH"
  )

  # 2) Pull + rebuild changed images + restart on the instance (DB volume persists).
  local id arr
  id="$(run_tf output -raw instance_id 2>/dev/null || true)"
  [ -n "$id" ] || die "Cannot read instance_id (is the stack applied & running?)."
  log "Applying changes on instance $id via SSM (git pull + rebuild + restart) ..."

  arr=$(cat <<JSON
["export DOCKER_BUILDKIT=0; cd /opt/erp-app && git pull origin $BRANCH 2>&1 | LC_ALL=C sed 's/[^[:print:]]//g'","export DOCKER_BUILDKIT=0; cd /opt/erp-app && docker compose -f docker-compose.demo.yaml build 2>&1 | tail -n 25 | LC_ALL=C sed 's/[^[:print:]]//g'","systemctl restart erp-demo.service 2>&1 | LC_ALL=C sed 's/[^[:print:]]//g'","sleep 12; docker ps --format '{{.Names}} {{.Status}}' 2>/dev/null | LC_ALL=C sed 's/[^[:print:]]//g'"]
JSON
)

   _ssm_exec "$id" "$arr"

   # 3) Mirror local data onto the EC2 databases. The committed backups in
   #    pg_backup/ (refreshed by `./deploy.sh backup`) are restored into the
   #    live EC2 Postgres so AWS shows the same data as your local machine.
   #    We stop the backend first (free DB connections) so pg_restore --clean can
   #    drop/recreate cleanly, then start it again.
   log "Restoring EC2 databases from committed backups (mirrors local) on $id ..."
   local restore=$(cat <<JSON
 ["docker stop hr-backend 2>&1 | tail -1","docker exec hr_postgres pg_restore --clean --if-exists --no-owner -U postgres -d hrdb /pg_backup/hrdb.backup 2>&1 | tail -3","docker exec hr_postgres pg_restore --clean --if-exists --no-owner -U postgres -d erpdb /pg_backup/erpdb.backup 2>&1 | tail -3","docker start hr-backend 2>&1 | tail -1","echo RESTORE_DONE"]
JSON
)
   _ssm_exec "$id" "$restore"

   # 4) Apply DB migrations explicitly. Idempotent (no-op after a full restore),
   #    but guarantees the columns exist if the restore is ever skipped. ERP models
   #    span both hrdb (DB_NAME) and erpdb (ERP_DB_NAME).
   log "Applying DB migrations on instance $id (hrdb + erpdb) ..."
   local mig=$(cat <<JSON
 ["docker cp /opt/erp-app/db/erp_migrations.sql hr_postgres:/tmp/erp_migrations.sql 2>&1 | LC_ALL=C sed 's/[^[:print:]]//g'","docker exec hr_postgres psql -U postgres -d hrdb -v ON_ERROR_STOP=0 -f /tmp/erp_migrations.sql 2>&1 | LC_ALL=C sed 's/[^[:print:]]//g'","docker exec hr_postgres psql -U postgres -d erpdb -v ON_ERROR_STOP=0 -f /tmp/erp_migrations.sql 2>&1 | LC_ALL=C sed 's/[^[:print:]]//g'","echo MIGRATIONS_DONE"]
JSON
)
   _ssm_exec "$id" "$mig"

  local url
  url="$(run_tf output -raw app_url 2>/dev/null || true)"
  [ -n "$url" ] && log "Done. App should be live shortly at $url (run ./deploy.sh status or ./deploy.sh diag to confirm)."
}

# ─────────────── CLI ───────────────
usage() {
  cat <<EOF
Usage: ./deploy.sh [command]

Commands:
  all      backup local DBs -> commit/push -> terraform apply + wait  (default)
  backup   dump local Docker DBs into pg_backup/ and push to $BRANCH
  up       terraform apply and wait for the app to come up
  down     terraform destroy (stop billing; data stays in pg_backup/)
  stop     stop EC2 (pause; keep EBS + EIP, ~$4/mo storage; app offline)
  start    start a stopped EC2 (systemd auto-restarts the stack)
  update   sync local changes -> git push -> cloud pulls, rebuilds, restarts (no tf rebuild)
  apply    alias for update
  status   check app health and print URL
  diag     print EC2 bootstrap log + docker ps + systemd status via SSM

Env overrides: DEPLOY_BRANCH, LOCAL_DB_CONTAINER, AWS_PROFILE, AWS_REGION,
               TF_AUTO (auto-approve), POLL_TIMEOUT, POLL_INTERVAL
EOF
}

main() {
  local cmd="${1:-all}"
  case "$cmd" in
    all)    do_backup; do_up ;;
    backup) do_backup ;;
    up)     do_up ;;
    down)   do_down ;;
    stop)   do_stop ;;
    start)  do_start ;;
    update|apply) do_update ;;
    status) do_status ;;
    diag)   require aws; ssm_diag ;;
    -h|--help|help) usage ;;
    *) err "unknown command: $cmd"; usage; exit 1 ;;
  esac
}

main "$@"

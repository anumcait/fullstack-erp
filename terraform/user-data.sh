#!/bin/bash
exec > /var/log/erp-bootstrap.log 2>&1
set -uo pipefail

REPO_DIR=/opt/erp-app

# Install Docker + deps if not already present (custom AMI has them)
if ! command -v docker >/dev/null 2>&1; then
  echo "==> Installing git, Docker, and AWS CLI"
  apt-get update -y
  apt-get install -y git curl ca-certificates gnupg unzip awscli
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sh /tmp/get-docker.sh
  apt-get install -y docker-compose-plugin docker-buildx-plugin || true
  systemctl enable --now docker
  for i in $(seq 1 30); do
    if docker info >/dev/null 2>&1; then echo "Docker ready"; break; fi
    sleep 3
  done
fi

# Clone or update repo
echo "==> Cloning repo"
if [ -d "$REPO_DIR/.git" ]; then
  cd "$REPO_DIR" && git fetch origin && git reset --hard "origin/${repo_branch}"
else
  rm -rf "$REPO_DIR"
  git clone -b "${repo_branch}" --single-branch "${repo_url}" "$REPO_DIR"
fi

# Build images (errors don't kill script, systemd retries)
echo "==> Building images"
LAST_COMMIT=$(git -C "$REPO_DIR" rev-parse HEAD)
BUILT_COMMIT=""
[ -f /opt/.last-built-commit ] && BUILT_COMMIT=$(cat /opt/.last-built-commit)
if [ "$LAST_COMMIT" != "$BUILT_COMMIT" ]; then
  echo "Code changed ($BUILT_COMMIT -> $LAST_COMMIT), rebuilding..."
  docker build --no-cache -t erp-backend:latest "$REPO_DIR/backend" || echo "Backend build failed"
  docker build --no-cache -t erp-frontend:latest "$REPO_DIR/frontend" || echo "Frontend build failed"
  docker build --no-cache -t erp-agent:latest "$REPO_DIR/agent_python" || echo "Agent build failed"
  echo "$LAST_COMMIT" > /opt/.last-built-commit
else
  echo "Code unchanged since last build, skipping"
fi

# Write systemd unit and start
echo "==> Starting stack"
cat > /etc/systemd/system/erp-demo.service <<UNIT
[Unit]
Description=ERP Demo Stack
Requires=docker.service
After=docker.service

[Service]
Type=simple
WorkingDirectory=$REPO_DIR
ExecStartPre=/usr/bin/docker compose -f ${compose_file} down --remove-orphans
ExecStart=/usr/bin/docker compose -f ${compose_file} up --remove-orphans
ExecStop=/usr/bin/docker compose -f ${compose_file} down --remove-orphans
TimeoutStartSec=0
Restart=always

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable --now erp-demo

# ────────────── Daily local-disk database backup (hrdb + erpdb) ──────────────
# Runs every day at 01:30 server time. Dumps both databases from the running
# postgres container into $REPO_DIR/pg_backup/daily/<YYYY-MM-DD>/ and keeps
# the last 14 daily backups on local disk (rotation).
cat > /usr/local/bin/erp-daily-backup.sh <<'BACKUP'
#!/bin/bash
set -uo pipefail
BACKUP_ROOT=/opt/erp-app/pg_backup/daily
TODAY=$(date +%F)
DEST="$BACKUP_ROOT/$TODAY"
mkdir -p "$DEST"

for DB in hrdb erpdb; do
  if docker ps --format '{{.Names}}' | grep -qx hr_postgres; then
    if docker exec hr_postgres pg_dump -U postgres -Fc -f /tmp/$DB.daily.backup $DB >/dev/null 2>&1; then
      docker cp hr_postgres:/tmp/$DB.daily.backup "$DEST/$DB.backup" >/dev/null 2>&1
      docker exec hr_postgres rm -f /tmp/$DB.daily.backup >/dev/null 2>&1
      echo "OK $DB -> $DEST/$DB.backup ($(stat -c%s "$DEST/$DB.backup" 2>/dev/null || echo 0) bytes)"
    else
      echo "FAIL $DB (pg_dump)"
    fi
  else
    echo "SKIP $DB (hr_postgres not running)"
  fi
done

# Rotate: keep the most recent 14 daily folders
ls -1dt "$BACKUP_ROOT"/*/ 2>/dev/null | tail -n +15 | xargs -r rm -rf
echo "BACKUP_DONE"
BACKUP
chmod +x /usr/local/bin/erp-daily-backup.sh

# Cron entry: 1:30 AM daily
( crontab -l 2>/dev/null | grep -v 'erp-daily-backup.sh' ; echo "30 1 * * * /usr/local/bin/erp-daily-backup.sh >> /opt/erp-app/pg_backup/daily-backup.log 2>&1" ) | crontab -
echo "==> Daily backup cron installed (01:30 server time, 14-day retention)"

echo "==> Bootstrap complete"
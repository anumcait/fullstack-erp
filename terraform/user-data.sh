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
echo "==> Bootstrap complete"
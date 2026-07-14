#!/bin/bash
exec > /var/log/erp-bootstrap.log 2>&1
set -euo pipefail

echo "==> Installing git and prerequisites"
apt-get update -y
apt-get install -y git curl ca-certificates gnupg

echo "==> Installing Docker (engine + compose plugin) via official script"
curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
sh /tmp/get-docker.sh
apt-get install -y docker-compose-plugin docker-buildx-plugin
systemctl enable --now docker
# Wait for the Docker daemon to be ready before any compose command.
for i in $(seq 1 30); do
  if docker info >/dev/null 2>&1; then echo "✅ Docker daemon ready."; break; fi
  echo "⏳ Waiting for Docker daemon (attempt $i/30)..."
  sleep 3
done

echo "==> Cloning repository (branch: ${repo_branch}) from ${repo_url}"
REPO_DIR=/opt/erp-app

# Wait for outbound network (GitHub) before cloning.
for i in $(seq 1 30); do
  if git ls-remote --heads "${repo_url}" >/dev/null 2>&1; then
    echo "✅ Network to ${repo_url} reachable."
    break
  fi
  echo "⏳ Waiting for network/GitHub (attempt $i/30)..."
  sleep 5
done

CLONED=0
for i in $(seq 1 5); do
  if [ ! -d "$REPO_DIR/.git" ]; then
    rm -rf "$REPO_DIR"
    if git clone -b "${repo_branch}" --single-branch "${repo_url}" "$REPO_DIR" 2>&1; then
      CLONED=1
      break
    fi
    echo "⚠️ Clone attempt $i failed, retrying in 5s..."
    sleep 5
  else
    CLONED=1
    break
  fi
done

if [ "$CLONED" -ne 1 ] || [ ! -d "$REPO_DIR/.git" ]; then
  echo "❌ FATAL: git clone of ${repo_url} (branch ${repo_branch}) failed after retries."
  echo "❌ Check /var/log/erp-bootstrap.log and the repo_url / repo_branch variables."
  exit 1
fi
echo "✅ Repository cloned to $REPO_DIR"

echo "==> Writing systemd unit"
cat > /etc/systemd/system/erp-demo.service <<UNIT
[Unit]
Description=ERP Demo Stack
Requires=docker.service
After=docker.service

[Service]
Type=simple
WorkingDirectory=$REPO_DIR
# Force the legacy Docker builder. The default buildx builder can hang
# (0% CPU, no progress) while exporting the very large agent image
# (torch + CUDA + chromadb + langchain); the legacy builder exports
# straight to the image store and is reliable for huge images.
Environment=DOCKER_BUILDKIT=0
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

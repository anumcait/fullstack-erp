#!/bin/bash
exec > /var/log/erp-bootstrap.log 2>&1
set -euo pipefail

echo "==> Installing git and prerequisites"
apt-get update -y
apt-get install -y git curl ca-certificates gnupg

echo "==> Installing Docker (engine + compose plugin) via official script"
curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
sh /tmp/get-docker.sh
systemctl enable --now docker

echo "==> Cloning repository (branch: ${repo_branch})"
REPO_DIR=/opt/erp-app
if [ ! -d "$REPO_DIR/.git" ]; then
  rm -rf "$REPO_DIR"
  git clone -b ${repo_branch} --single-branch ${repo_url} "$REPO_DIR"
fi

echo "==> Writing systemd unit"
cat > /etc/systemd/system/erp-demo.service <<UNIT
[Unit]
Description=ERP Demo Stack
Requires=docker.service
After=docker.service

[Service]
Type=simple
WorkingDirectory=$REPO_DIR
ExecStart=/usr/bin/docker compose -f ${compose_file} up
ExecStop=/usr/bin/docker compose -f ${compose_file} down
TimeoutStartSec=0
Restart=always

[Install]
WantedBy=multi-user.target
UNIT

systemctl daemon-reload
systemctl enable --now erp-demo
echo "==> Bootstrap complete"

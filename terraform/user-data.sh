#!/bin/bash
set -euo pipefail

# ── Install Docker + Compose plugin + Git ──
apt-get update -y
apt-get install -y docker.io docker-compose-plugin git curl
systemctl enable --now docker

# ── Clone repo once (persists on EBS across stop/start) ──
REPO_DIR=/opt/erp-app
if [ ! -d "$REPO_DIR/.git" ]; then
  rm -rf "$REPO_DIR"
  git clone ${repo_url} "$REPO_DIR"
fi

# ── Systemd unit: launch the stack on every boot ──
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

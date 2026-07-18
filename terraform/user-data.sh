#!/bin/bash
exec > /var/log/erp-bootstrap.log 2>&1
set -euo pipefail

echo "==> Installing git and prerequisites"
apt-get update -y
apt-get install -y git curl ca-certificates gnupg unzip

# Install AWS CLI (if not present) to pull database backups from S3 and manage ECR logins
if ! command -v aws >/dev/null 2>&1; then
  echo "==> Installing AWS CLI"
  apt-get install -y awscli || true
fi

echo "==> Installing Docker (engine + compose plugin) via official script if missing"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sh /tmp/get-docker.sh
  apt-get install -y docker-compose-plugin docker-buildx-plugin
else
  echo "✅ Docker is already installed."
fi

# Ensure docker-compose plugin is present
if ! docker compose version >/dev/null 2>&1; then
  echo "==> Installing Docker compose plugin"
  apt-get install -y docker-compose-plugin || true
fi

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

echo "==> Building Docker images locally (tagged with ECR registry URL for compose)"
docker build -t ${ecr_registry}/erp-backend:latest "$REPO_DIR/backend"
docker build -t ${ecr_registry}/erp-frontend:latest "$REPO_DIR/frontend"
docker build -t ${ecr_registry}/erp-agent:latest "$REPO_DIR/agent_python"
echo "✅ Local build complete — containers use these images until ECR images are pushed"

echo "==> Writing systemd unit (pulls updated images from ECR on restart)"
cat > /etc/systemd/system/erp-demo.service <<UNIT
[Unit]
Description=ERP Demo Stack
Requires=docker.service
After=docker.service

[Service]
Type=simple
WorkingDirectory=$REPO_DIR
Environment=ECR_REGISTRY=${ecr_registry}
ExecStartPre=/bin/bash -c "/usr/bin/aws ecr get-login-password --region ${aws_region} | /usr/bin/docker login --username AWS --password-stdin ${ecr_registry}"
ExecStartPre=/usr/bin/docker compose -f ${compose_file} pull 2>&1 | tail -5
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

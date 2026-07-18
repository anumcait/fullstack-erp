#!/bin/bash
cd /opt/erp-app

# Fix env_file path
sed -i 's|\.backend\.env\.development|./backend/.env.development|g' docker-compose.demo.yaml

echo "--- Verifying ---"
grep -n 'image:\|env_file' docker-compose.demo.yaml

echo "--- Starting ---"
docker compose -f docker-compose.demo.yaml down --remove-orphans 2>&1
docker compose -f docker-compose.demo.yaml up -d --remove-orphans 2>&1
sleep 10
docker ps

#!/bin/bash
cd /opt/erp-app

# Overwrite the broken remote compose with the correct version
cat > docker-compose.demo.yaml << 'COMPOSE'
services:
  db:
    image: postgres:17
    container_name: hr_postgres
    environment:
      POSTGRES_DB:       hrdb
      POSTGRES_USER:     postgres
      POSTGRES_PASSWORD: postgres
    volumes:
      - hr_db_data:/var/lib/postgresql/data
      - ./init-scripts/init-db.sh:/docker-entrypoint-initdb.d/01-init-db.sh:ro
      - ./pg_backup:/pg_backup:rw
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d hrdb"]
      interval: 15s
      timeout: 10s
      retries: 30
      start_period: 300s
    shm_size: '256mb'
    command: ["/bin/bash", "-c", "/docker-entrypoint-initdb.d/01-init-db.sh & exec docker-entrypoint.sh postgres"]
    restart: unless-stopped
    networks: [hr-network]

  backend:
    image: erp-backend:latest
    container_name: hr-backend
    env_file:
      - ./backend/.env.development
    environment:
      DB_HOST: db
      DB_PORT: 5432
      ERP_DB_HOST: db
      ERP_DB_PORT: 5432
      PYTHON_AGENT_URL: http://agent_python:8001/process
    depends_on:
      db:
        condition: service_healthy
      agent_python:
        condition: service_started
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/"]
      interval: 20s
      timeout: 10s
      retries: 20
      start_period: 300s
    networks: [hr-network]
    restart: unless-stopped

  agent_python:
    image: erp-agent:latest
    container_name: hr-python-agent
    deploy:
      resources:
        limits:
          cpus: '0.50'
          memory: 512M
    networks: [hr-network]
    restart: unless-stopped

  frontend:
    image: erp-frontend:latest
    container_name: hr-frontend
    depends_on:
      backend:
        condition: service_healthy
    environment:
      - API_TARGET=http://backend:5000
      - VITE_API_URL=
    networks: [hr-network]
    restart: unless-stopped

  nginx:
    image: nginx:latest
    container_name: hr-nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      frontend:
        condition: service_started
      backend:
        condition: service_healthy
    networks: [hr-network]
    restart: unless-stopped

networks:
  hr-network:
    driver: bridge

volumes:
  hr_db_data:
COMPOSE

echo "--- Compose fixed ---"
grep -n 'image:\|env_file\|volumes:' docker-compose.demo.yaml

echo "--- Restarting stack ---"
docker compose -f docker-compose.demo.yaml down --remove-orphans
docker compose -f docker-compose.demo.yaml up -d --remove-orphans
sleep 10
docker ps

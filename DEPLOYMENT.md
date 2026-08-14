# Production Deployment Guide

## Overview
This document covers the exact steps to deploy the ERP HR module to production, including the recent changes:
- Overnight shift attendance fix (22:00 - 06:30)
- AddEmployee UI overhaul (13 tabs, responsive grid)
- Address & Communication compact layout

---

## Pre-Deployment Checklist

- [ ] All tests pass locally
- [ ] Code reviewed and merged to `main`
- [ ] Version tagged (`v1.x.x`)
- [ ] Database backup taken
- [ ] Staging environment validated

---

## 1. Code Deployment (Git)

```bash
# On local machine - ensure clean state
git status
git add -A
git commit -m "release: HR module - attendance overnight shift fix, AddEmployee UI overhaul, Address compact layout"
git tag v1.2.0
git push origin main --tags
```

### Changed Files (Must Deploy)

**Backend:**
```
backend/controllers/HR/attendanceController.js    # classifySwipedDay overnight fix
```

**Frontend:**
```
frontend/src/component/HR/Employee/AddEmployee.jsx    # All tabs responsive grid
frontend/src/component/Partials/Header.jsx            # Logout dialog styling
frontend/src/component/Layout/Sidebar.jsx             # Logout dialog styling
```

---

## 2. Backend Deployment

### Option A: PM2 (Traditional)
```bash
ssh user@prod-server
cd /opt/erp/backend

# Pull latest
git pull origin main

# Clean install production dependencies
npm ci --production

# Restart with zero-downtime
pm2 restart erp-backend --update-env

# Verify
pm2 logs erp-backend --lines 50
```

### Option B: Docker Compose
```bash
ssh user@prod-server
cd /opt/erp

# Pull images
docker compose -f docker-compose.prod.yml pull

# Build and deploy
docker compose -f docker-compose.prod.yml up -d --build backend

# Verify
docker compose -f docker-compose.prod.yml logs -f backend
```

---

## 3. Database Migrations

```bash
cd /opt/erp/backend

# Check pending migrations
npx sequelize-cli db:migrate:status --env production

# Run if any pending
npx sequelize-cli db:migrate --env production
```

### Verify Critical Data
```sql
-- Check overnight shifts exist
SELECT empid, shift_date, shift_start_time, shift_end_time 
FROM shift_schedules 
WHERE shift_end_time < shift_start_time;

-- Verify ShiftMaster has lunch times
SELECT shift_cd, start_time, end_time, lunch_start_time, lunch_end_time 
FROM shift_master;
```

---

## 4. Frontend Deployment

```bash
ssh user@prod-server
cd /opt/erp/frontend

# Pull latest
git pull origin main

# Install & build
npm ci
npm run build

# Deploy to nginx root
sudo cp -r dist/* /var/www/erp/

# Verify build output
ls -la /var/www/erp/assets/ | head -20
```

### Expected Build Output
```
index.html
assets/index-<hash>.js      (~4.5MB main chunk)
assets/index-<hash>.css     (~114KB)
assets/vendor-<hash>.js     (if code-split)
```

---

## 5. Environment Configuration

### Backend `.env` (Production)
```bash
# /opt/erp/backend/.env
NODE_ENV=production
PORT=5000

# Database (use correct DB name: hrdb or erpdb)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=hrdb
DB_USER=erp_user
DB_PASS=********          # Use secrets manager in real prod

# Auth
JWT_SECRET=********       # 64-char random string
SESSION_SECRET=********
JWT_EXPIRES_IN=8h

# CORS
FRONTEND_URL=https://erp.yourdomain.com

# File upload (if used)
UPLOAD_PATH=/opt/erp/uploads
MAX_FILE_SIZE=10485760
```

### Frontend Nginx Config
```nginx
# /etc/nginx/sites-available/erp
server {
    listen 80;
    server_name erp.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name erp.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/erp.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/erp.yourdomain.com/privkey.pem;

    root /var/www/erp;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    # Frontend SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
    }

    # Static assets - long cache
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml application/json;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/erp /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 6. Post-Deploy Verification

### Automated Health Checks
```bash
# Backend health
curl -f https://erp.yourdomain.com/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Frontend loads
curl -f https://erp.yourdomain.com/ | grep -c "erp"
```

### Manual Critical Flow Tests

| Test Case | Steps | Expected |
|-----------|-------|----------|
| **Login** | Valid credentials → Dashboard | JWT stored, redirect to `/dashboard` |
| **Add Employee** | Navigate to `/add-employee` → Fill all 13 tabs | All tabs render, no console errors |
| **Reporting To** | Official tab → Reporting To dropdown | Current employee excluded from list |
| **Address Section** | Personal tab → Address & Communication | Compact 2-col layout, "Same as" centered |
| **3rd Shift Attendance** | Create emp with shift 22:00-06:30 → Punch 22:00/06:30 | Status = "Present" |
| **3rd Shift Early Out** | Same emp → Punch 22:00/06:15 | Status = "Half Day" |
| **Muster Roll** | Generate month with overnight shifts | Overnight days show correct status |
| **Logout** | Sidebar & Topbar logout buttons | Both show same styled confirmation |

### Log Verification
```bash
# Check for errors
pm2 logs erp-backend --lines 200 | grep -i -E "error|warn|exception"

# Or Docker
docker compose -f docker-compose.prod.yml logs backend | grep -i error
```

---

## 7. Rollback Procedure

### Code Rollback
```bash
# Backend
cd /opt/erp/backend
git checkout v1.1.0  # previous tag
npm ci --production
pm2 restart erp-backend

# Frontend
cd /opt/erp/frontend
git checkout v1.1.0
npm ci && npm run build
sudo cp -r dist/* /var/www/erp/
```

### Database Rollback (if migration ran)
```bash
cd /opt/erp/backend
npx sequelize-cli db:migrate:undo --env production
# Or specific migration:
npx sequelize-cli db:migrate:undo:all --to XXXXXXXXXXXX --env production
```

---

## 8. Monitoring & Alerts

### Key Metrics to Monitor
| Metric | Tool | Warning | Critical |
|--------|------|---------|----------|
| API p95 latency | Datadog/Prometheus | > 1s | > 3s |
| Error rate |  | > 0.5% | > 2% |
| DB connection pool |  | > 70% | > 90% |
| Memory usage |  | > 75% | > 90% |
| CPU usage |  | > 70% | > 90% |
| Disk space |  | > 80% | > 95% |

### Log Aggregation
```bash
# Ensure logs ship to centralized system
# PM2: pm2 install pm2-logrotate
# Docker: Configure logging driver (json-file + max-size)
```

---

## 9. Communication

### Deployment Notification Template
```
Subject: [DEPLOY] ERP v1.2.0 - HR Module Updates

Deployed: 2026-08-14 14:30 UTC
Environment: Production
Deployed by: [Name]

Changes:
- FIX: Overnight shift attendance (22:00-06:30) now calculates correctly
- UI: AddEmployee form - all 13 tabs responsive grid layout
- UI: Address & Communication - compact 2-column design
- UI: Logout dialogs unified styling

Testing: Staging validated - all critical flows pass

Rollback: git checkout v1.1.0 (if issues)
```

---

## 10. Post-Deploy Support

### First 2 Hours
- [ ] Monitor error rates
- [ ] Verify attendance calculations for overnight shifts
- [ ] Confirm muster roll generates correctly
- [ ] Check user feedback channel

### First 24 Hours
- [ ] Review performance metrics
- [ ] Verify backup completed
- [ ] Document any issues found

---

## Appendix: Quick Commands Reference

```bash
# Full backend redeploy
cd /opt/erp/backend && git pull && npm ci --production && pm2 restart erp-backend

# Full frontend redeploy
cd /opt/erp/frontend && git pull && npm ci && npm run build && sudo cp -r dist/* /var/www/erp/

# View live logs
pm2 logs erp-backend -f

# Check PM2 status
pm2 status
```

---

## Docker Database Backup & Restore (Production)

The database runs in container `hr_postgres` with database `hrdb`, user `postgres`.

### Daily Backup (Cron on Host) - Custom Format
```bash
# /opt/erp/scripts/backup-db.sh
#!/bin/bash
set -e

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/erp/backups/daily"
CONTAINER="hr_postgres"
RETENTION_DAYS=14

mkdir -p "$BACKUP_DIR"

# Backup hrdb (custom format, parallel, background)
docker exec -t "$CONTAINER" pg_dump -U postgres -Fc -j 4 hrdb > "$BACKUP_DIR/hrdb_${DATE}.dump" &

# Backup erpdb (custom format, parallel, background)
docker exec -t "$CONTAINER" pg_dump -U postgres -Fc -j 4 erpdb > "$BACKUP_DIR/erpdb_${DATE}.dump" &

# Wait for both to complete
wait

# Verify backups
for f in "$BACKUP_DIR"/hrdb_${DATE}.dump "$BACKUP_DIR"/erpdb_${DATE}.dump; do
  [[ -s "$f" ]] || { echo "FAIL: $f empty"; exit 1; }
done

echo "[$(date)] Backups complete: $(du -h "$BACKUP_DIR"/*${DATE}.dump | cut -f1)"

# Cleanup old backups
find "$BACKUP_DIR" -name "*.dump" -mtime +$RETENTION_DAYS -delete
```

```bash
chmod +x /opt/erp/scripts/backup-db.sh
# Add to crontab: 0 2 * * * /opt/erp/scripts/backup-db.sh
```

### Manual Backup (Ad-hoc) - Custom Format
```bash
# Backup both databases in parallel (custom format)
docker exec -t hr_postgres pg_dump -U postgres -Fc -j 4 hrdb > /opt/erp/backups/manual/hrdb_$(date +%Y%m%d_%H%M%S).dump &
docker exec -t hr_postgres pg_dump -U postgres -Fc -j 4 erpdb > /opt/erp/backups/manual/erpdb_$(date +%Y%m%d_%H%M%S).dump &
wait
```

### Restore from Backup (Custom Format)
```bash
# 1. Stop backend
docker compose -f docker-compose.prod.yml stop backend

# 2. Restore hrdb (clean, parallel, no owner)
docker exec -i hr_postgres pg_restore -U postgres -d hrdb -c -j 4 --no-owner < /opt/erp/backups/daily/hrdb_20260814_020000.dump

# 3. Restore erpdb
docker exec -i hr_postgres pg_restore -U postgres -d erpdb -c -j 4 --no-owner < /opt/erp/backups/daily/erpdb_20260814_020000.dump

# 4. Verify
docker exec -t hr_postgres psql -U postgres -d hrdb -c "SELECT count(*) FROM employee_master;"
docker exec -t hr_postgres psql -U postgres -d erpdb -c "SELECT count(*) FROM employee_master;"

# 5. Restart backend
docker compose -f docker-compose.prod.yml start backend
```

### Quick Reference Card (Docker - Custom Format)

| Task | Command |
|------|---------|
| **Backup hrdb** | `docker exec -t hr_postgres pg_dump -U postgres -Fc -j 4 hrdb > hrdb.dump &` |
| **Backup erpdb** | `docker exec -t hr_postgres pg_dump -U postgres -Fc -j 4 erpdb > erpdb.dump &` |
| **Wait for completion** | `wait` |
| **Restore hrdb** | `docker exec -i hr_postgres pg_restore -U postgres -d hrdb -c -j 4 --no-owner < hrdb.dump` |
| **Restore erpdb** | `docker exec -i hr_postgres pg_restore -U postgres -d erpdb -c -j 4 --no-owner < erpdb.dump` |
| **List backups** | `ls -lh /opt/erp/backups/daily/*.dump` |
| **Delete old** | `find /opt/erp/backups/daily -name "*.dump" -mtime +14 -delete` |
| **Connect to hrdb** | `docker exec -it hr_postgres psql -U postgres -d hrdb` |
| **Connect to erpdb** | `docker exec -it hr_postgres psql -U postgres -d erpdb` |

---

**Document Version**: 1.0  
**Last Updated**: 2026-08-14  
**Owner**: DevOps Team

---

**Document Version**: 1.0  
**Last Updated**: 2026-08-14  
**Owner**: DevOps Team
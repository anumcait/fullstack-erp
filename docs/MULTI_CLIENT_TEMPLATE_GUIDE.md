# Multi-Client ERP Template Guide

## 1. Overview
This codebase is the **Master ERP Template** designed for fast, isolated deployments across multiple business clients. Each client gets their own dedicated instance (Frontend, Backend, and Database), ensuring:
- **100% Data Isolation**: Physical database separation (no risk of cross-client data leak).
- **Independent Customizations**: Unique shift schedules, payroll rules, statutory rates, logos, and invoices.
- **Independent Upgrades & Backups**: One client's changes or maintenance never affects other clients.

---

## 2. Multi-Client Architecture Pattern

```
                           Cloudflare (Free SSL & CDN)
                                       │
                    ┌──────────────────┼──────────────────┐
                    ▼                  ▼                  ▼
             erp.anushaengg.com     client2.domain.com   client3.domain.com
             (Client 1)             (Client 2)           (Client 3)
                    │                  │                  │
               Host Port 80       Host Port 80       Host Port 80
                    └──────────────────┬──────────────────┘
                                       │
                             Gateway Nginx (Port 80)
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
Client 1 (Anusha):             Client 2:                      Client 3:
- Frontend: :5173              - Frontend: :5174              - Frontend: :5175
- Backend:  :5000              - Backend:  :5001              - Backend:  :5002
- DB:       :5434 (hrdb)       - DB:       :5435 (hrdb_c2)    - DB:       :5436 (hrdb_c3)
```

---

## 3. Client Port & Resource Convention

| Client Identifier | Domain / Subdomain | Frontend Port | Backend Port | Postgres Host Port | Database Name |
|---|---|---|---|---|---|
| **Client 1** (Anusha) | `erp.anushaengg.com` | `5173` | `5000` | `5434` | `hrdb`, `erpdb` |
| **Client 2** | `client2.anushaengg.com` | `5174` | `5001` | `5435` | `hrdb_c2`, `erpdb_c2` |
| **Client 3** | `client3.anushaengg.com` | `5175` | `5002` | `5436` | `hrdb_c3`, `erpdb_c3` |

*Memory Footprint per Client instance:*
- Frontend (static Nginx): **~3.5 MB**
- Backend (Node.js): **~55–60 MB**
- PostgreSQL (Alpine / 17): **~35–40 MB**
- **Total per client: ~100 MB RAM** (A 1GB RAM VM can easily host 4–5 active client instances!).

---

## 4. How to Onboard a New Client in 5 Minutes

### Step A: Cloudflare DNS
1. Add an `A` record for the new subdomain (e.g. `client2`) pointing to the server IP (`129.225.109.92`), with **Proxied** (Orange Cloud) enabled.

### Step B: Gateway Nginx Route
In `nginx.conf`, add a new `server` block for the new client:
```nginx
upstream client2_frontend { server 172.18.0.1:5174; keepalive 32; }
upstream client2_backend  { server 172.18.0.1:5001; keepalive 32; }

server {
    listen 80;
    server_name client2.anushaengg.com;
    client_max_body_size 100M;

    location / {
        proxy_pass http://client2_frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
    location /api/ {
        proxy_pass http://client2_backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```
Reload gateway: `docker exec anufs-gateway nginx -s reload`.

### Step C: Client Docker Compose Stack
Create `docker-compose.client2.yml` with the client's assigned ports and database:
- `RESTORE_MODE=schema` (starts with an empty, clean database for the client with zero demo data).
- Or `RESTORE_MODE=full` if copying initial master data / demo templates.
- Run: `docker compose -f docker-compose.client2.yml up -d`

---

## 5. Client Customization Points Checklist

When onboarding a new client, configure these settings:

### 1. Company Profile (`/company-setup` or Company Settings)
- **Company Name & Short Name**
- **Logo & Favicon** (displayed in header, reports, and payslips)
- **Registered Address & Contact Info**
- **GSTIN, PAN, CIN**
- **PF Establishment Code & ESI Code**

### 2. Working Shifts & Attendance Policies
- **Shift Definitions**: General Shift (09:00–17:30), Night Shifts, Rotating Shifts.
- **Late Coming Grace Period**: Configured in `constants/attendanceRules.js` (e.g. 30 min threshold, first-late exempt).
- **Overtime Rules**: Weekday OT multiplier vs Weekend/Holiday OT multiplier (e.g. 1.5x / 2.0x).
- **Weekly Off Policy**: Fixed Sunday vs Dynamic / Shift-based weekly off.

### 3. Payroll & Statutory Deductions
- **PF Ceiling**: Default ₹25,000 (12% = max ₹3,000 deduction) or customized to company policy.
- **ESI Eligibility**: ₹21,000 gross threshold.
- **Professional Tax (PT)**: State-specific slabs (configured in `payrollController.js`).
- **Salary Components**: Basic, HRA, Conveyance, Washing Allowance, Attendance Bonus.

### 4. Financial Year & Accounting
- **Active Financial Year**: Auto-initialized on startup (e.g. 2026-27).
- **Chart of Accounts**: Pre-seeded standard industrial chart of accounts, customizable per client.
- **Voucher & Invoice Prefixes**: Set sequence prefixes (e.g. `INV-`, `PO-`, `GRN-`).


# Deployment Runbook — Enterprise ERP (Multi-Company)

This document describes the **recommended, production-grade way** to deploy this ERP to
many independent companies/tenants. Each company gets its **own isolated deployment**
(separate database, separate containers, separate domain) — the safest model for an
enterprise ERP handling employee PII, payroll and finance data.

> Goal for every new company: an **empty database with all tables but no data**, a
> **first-run "Create Company" setup**, and a clean hand-over to the company's admin.

---

## Quick Start — What to do (per company)

This is the actionable checklist. Commands are PowerShell (Windows host); on Linux/macOS drop
the `$env:` and use `docker compose` the same way.

### Easiest way (no schema dumps — recommended to start)
Let the backend build the empty tables via Sequelize sync. No gold dumps, nothing to commit.

> **Shell-agnostic:** Docker Compose auto-loads a `.env` file in the project directory, so set
> `RESTORE_MODE` there — it works the same in **Git Bash and PowerShell** (no `export`/`$env:`).
> (If you prefer inline: Git Bash → `export RESTORE_MODE=none`; PowerShell → `$env:RESTORE_MODE="none"`.)

```bash
# .env  (repo root, alongside docker-compose.yaml)
RESTORE_MODE=none
```
```bash
# backend/.env:  DB_SYNC_FORCE=false, SESSION_SECRET=<random>, COOKIE_SECURE=true
# frontend/.env.production:  VITE_API_URL=
docker compose -p companyA up -d --build
# open URL -> Create Company -> login admin -> create HR users -> seed masters
```
> Caveat: relies on all schema objects being models/migrations. If you add raw-SQL
> views/functions, use the `schema` method below for that company.

### Full method (schema-only dump — use once models are stable)
Do **Step 0 once** (gold schema), then **Steps 1–12 for each company**.

### Step 0 — One-time: create the empty "gold" schema (from your reference DB)
```powershell
docker exec hr_postgres pg_dump -U postgres -Fc --schema-only hrdb  -f /pg_backup/hrdb_schema.dump
docker exec hr_postgres pg_dump -U postgres -Fc --schema-only erpdb -f /pg_backup/erpdb_schema.dump
```
This writes `hrdb_schema.dump` + `erpdb_schema.dump` into the repo's `pg_restore/` (mounted
as `/pg_backup`). Commit them. **Regenerate whenever you change models.**

### For each new company

**1. Checkout the code at a company-specific path**
```powershell
git clone <repo> C:\erp\companyA
cd C:\erp\companyA
```

**2. Create `backend\.env`** (copy `backend\.env.example`):
```ini
DB_NAME=hrdb
DB_USER=postgres
DB_PASSWORD=<STRONG_UNIQUE_PASSWORD>
ERP_DB_NAME=erpdb
ERP_DB_PASSWORD=<STRONG_UNIQUE_PASSWORD>
DB_SYNC_FORCE=false
SESSION_SECRET=<LONG_RANDOM_STRING>
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
CORS_ORIGIN=https://erp.companyA.com
```

**3. Create `frontend\.env.production`**
```ini
VITE_API_URL=
```
(empty = same-origin behind the proxy; otherwise set `https://erp.companyA.com`).

**4. Enable empty-schema restore** — set it in the repo-root `.env` (works in Git Bash &
PowerShell alike; Compose auto-loads it):
```bash
# .env  (repo root)
RESTORE_MODE=schema
```
*(Inline alternative — Git Bash: `export RESTORE_MODE=schema`; PowerShell: `$env:RESTORE_MODE="schema"`.)*

**5. Deploy (unique project name isolates containers/volumes per company)**
```powershell
docker compose -p companyA up -d --build
```

**6. Verify it's empty (tables exist, 0 rows)**
```powershell
docker exec companyA-db-1 psql -U postgres -d hrdb -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';"
docker exec companyA-db-1 psql -U postgres -d hrdb -c "SELECT COUNT(*) FROM ""EmployeeMaster"";"
```

**7. First-run company setup** — open `https://erp.companyA.com` → the **Create Company**
form appears (no company configured yet). Enter Company Name*, GSTIN, PAN, etc. → **Create Company**.

**8. Secure the admin** — log in with `admin` / `AUCTOR`, **change the password immediately**.

**9. Create HR accounts** — **Settings → User Access** → add the company's HR Admin + operators
(roles/permissions).

**10. Seed master data** (before any transactions): Shift Master, Holidays, Leave Types
(`/leaves-master`), and payroll/PF/ESI config in Company Settings.

**11. TLS / proxy** — terminate HTTPS at `nginx` (bind your cert in `nginx/`), redirect
HTTP→HTTPS, set HSTS.

**12. Backups** — schedule daily `pg_dump -Fc hrdb` + `erpdb` to off-host storage (see §9).

### Variants
- Sample data instead of empty: skip Step 4 (`RESTORE_MODE` defaults to `full`).
- Build tables from code only (no dump): `RESTORE_MODE=none` in Step 4.

---

## 1. Architecture & Deployment Model

| Aspect | Recommendation |
|---|---|
| Tenancy | **One isolated instance per company** (separate DB + containers + domain). Avoid shared multi-tenant DB for payroll/HR data. |
| Database | PostgreSQL 17, one `hrdb` + one `erpdb` per company. |
| Stack | Docker Compose (or Kubernetes per namespace). Reverse proxy + TLS in front. |
| Secrets | Per-company `.env` files / secrets manager. **Never** commit real secrets. |
| Empty schema | `RESTORE_MODE=schema` restores a **schema-only dump** (all tables, no rows). |

Why isolated instances: regulatory data isolation, independent upgrade cadence, blast-radius
containment, and simpler per-company backups/restores.

---

## 2. Prerequisites (per company)

- Linux host (or VM) with Docker Engine + Docker Compose v2.
- A DNS record for the company, e.g. `erp.companyA.com`, pointing to the host/public IP.
- A valid TLS certificate (Let's Encrypt or corporate CA) for the proxy.
- A strong, unique `POSTGRES_PASSWORD` and app session secret per company.
- This repo cloned at a company-specific path, e.g. `/opt/erp/companyA`.

---

## 3. Prepare the schema-only "gold" dump (do this ONCE)

Generate empty-schema dumps from a **reference** database that already has the full, current
schema (your master/dev DB). These dumps are committed to the repo under `pg_restore/` and
reused for every new company.

```bash
# From a host with access to the reference Postgres container (db container = hr_postgres)
docker exec hr_postgres pg_dump -U postgres -Fc --schema-only hrdb -f /pg_backup/hrdb_schema.dump
docker exec hr_postgres pg_dump -U postgres -Fc --schema-only erpdb -f /pg_backup/erpdb_schema.dump
```

Copy the resulting `hrdb_schema.dump` and `erpdb_schema.dump` into the repo's `pg_restore/`
folder and commit them. They contain **all tables, indexes, constraints, sequences, views
and functions — but zero rows**.

> Refresh these dumps whenever you change models/migrations, then commit, so every new
> company gets the latest schema.

---

## 4. Per-Company Deployment — Step by Step

### Step 4.1 — Clone / checkout at a company path
```bash
git clone <repo> /opt/erp/companyA
cd /opt/erp/companyA
```

### Step 4.2 — Configure backend environment
Create `backend/.env` (copy `backend/.env.example`) and set, **at minimum**:

```ini
# DB (hrdb)
DB_HOST=db
DB_PORT=5432
DB_NAME=hrdb
DB_USER=postgres
DB_PASSWORD=<STRONG_UNIQUE_PASSWORD>

# ERP DB
ERP_DB_HOST=db
ERP_DB_PORT=5432
ERP_DB_NAME=erpdb
ERP_DB_USER=postgres
ERP_DB_PASSWORD=<STRONG_UNIQUE_PASSWORD>

# Never force-drop tables in production
DB_SYNC_FORCE=false

# Session / security
SESSION_SECRET=<LONG_RANDOM_STRING>
COOKIE_SECURE=true          # true behind HTTPS
COOKIE_SAME_SITE=none       # 'none' if frontend/backend on different subdomains; 'lax' if same-site
CORS_ORIGIN=https://erp.companyA.com
```

> The API enforces **session auth globally** (`backend/app.js` → `requireAuth`); only
> `/api/auth/*`, `/api/company-settings` and `GET /api/settings/company` are public. All HR,
> payroll and ERP endpoints require a logged-in session.

### Step 4.3 — Configure frontend environment
`frontend/.env.production`:
```ini
# Empty = same-origin (recommended when proxy serves API + UI on one domain)
VITE_API_URL=
# If UI and API are on different origins, set the absolute API base:
# VITE_API_URL=https://erp.companyA.com
```

### Step 4.4 — Choose empty-schema restore
Set the restore mode to `schema` so the company starts with empty tables:

```bash
export RESTORE_MODE=schema        # reads hrdb_schema.dump / erpdb_schema.dump
```

(Default `full` restores sample data; `none` skips restore and lets the backend build tables
via Sequelize sync — use `none` only if you intentionally rely on sync for the full schema.)

### Step 4.5 — Isolate this company's containers & data
Use a **unique Compose project name** so volumes/containers never collide with another
company on the same host:

```bash
docker compose -p companyA up -d --build
```

This brings up: `db` (Postgres), `backend`, `frontend`, `agent_python`, `nginx`.

On first start, `init-scripts/init-db.sh` runs with `RESTORE_MODE=schema` and restores the
**empty schema** into `hrdb` and `erpdb`. The backend then boots; `sequelize.sync()` is a
no-op because tables already exist.

### Step 4.6 — Verify empty schema
```bash
docker exec -it companyA-db-1 psql -U postgres -d hrdb -c \
  "SELECT COUNT(*) AS tables FROM information_schema.tables WHERE table_schema='public';"
# Expect > 0 tables and 0 rows in business tables, e.g.:
docker exec -it companyA-db-1 psql -U postgres -d hrdb -c 'SELECT COUNT(*) FROM "EmployeeMaster";'
# -> 0
```

### Step 4.7 — TLS / reverse proxy
Terminate TLS at the included `nginx` (or your corporate proxy) and proxy `/` → frontend,
`/api` → backend. Redirect HTTP→HTTPS. Set HSTS. Example `nginx/nginx.conf` already exists;
bind your certificate there.

---

## 5. First-Run Company Setup (Tally-style)

Because no company is configured yet, the login screen shows a **"Create Company"** form
(backend `GET /api/settings/company` returns `null` → frontend `CompanyGate` redirects to
`/company-setup`).

1. Open `https://erp.companyA.com`.
2. Fill **Company Name\***, Address, GSTIN, PAN, Phone, Email, CIN, Website → **Create Company**.
   - This `POST /api/settings/company` is intentionally **public for first creation only**;
     later updates require login (controller returns `403` otherwise).
3. After success the screen returns to login. The company letterhead/branding now shows the
   real name everywhere (no dummy "ABC Company").

---

## 6. Create Admin & HR Accounts

1. Log in with the bootstrapped admin (`admin` / `AUCTOR` — **change this password immediately**).
2. Go to **Settings → User Access** (`/useraccess`) and create:
   - An **HR Admin** user (role `ADMIN` or a dedicated HR role) for the company's HR staff.
   - Additional HR / payroll operators with least-privilege roles/permissions.
3. Hand the HR Admin credentials to the company. Deactivate or rotate the generic `admin` if
   not needed operationally.

> User accounts are required before any HR staff can enter data — the API is auth-protected.

---

## 7. Seed Master Data (before transactions)

HR/payroll/attendance need master data. Enter these via the UI (no seed script required):

- **Shift Master** (`/shift-master`), **Holiday List** (`/holidays`)
- **Leave Types** → `LeaveMaster` (`/leaves-master`)
- **Company Settings** → payroll/PF/ESI config, PT rate, OT multiplier (`/settings`)
- **Departments / Divisions** are free-text on the employee form; standardise them first.

Do this as part of onboarding so the first employee/attendance/payroll entries validate.

---

## 8. Go-Live Checklist

- [ ] Unique `POSTGRES_PASSWORD` + `SESSION_SECRET` per company (not defaults).
- [ ] `DB_SYNC_FORCE=false` in production.
- [ ] `RESTORE_MODE=schema` → verified empty tables, 0 rows.
- [ ] TLS terminated; HTTP→HTTPS redirect; cookies `Secure` + correct `SameSite`.
- [ ] Company created via first-run setup; letterhead correct.
- [ ] Admin password changed; HR user accounts created.
- [ ] Master data (shifts, holidays, leave types, payroll config) entered.
- [ ] Daily backup job configured (Section 9).
- [ ] Monitoring/healthcheck (`/`) and container `restart` policies verified.

---

## 9. Backup & Disaster Recovery

Per company, schedule an automated dump (off-host retention):

```bash
# Daily full backup
docker exec companyA-db-1 pg_dump -U postgres -Fc hrdb  -f /pg_backup/companyA_hrdb_$(date +%F).dump
docker exec companyA-db-1 pg_dump -U postgres -Fc erpdb -f /pg_backup/companyA_erpdb_$(date +%F).dump
# Copy to off-host storage; retain e.g. 30 daily / 12 monthly
```

Restore (disaster recovery):
```bash
docker exec -i companyA-db-1 pg_restore -U postgres --clean --if-exists -d hrdb  /pg_backup/companyA_hrdb_YYYY-MM-DD.dump
```

---

## 10. Upgrades & Schema Changes

1. In the codebase, change models/migrations as needed.
2. Regenerate the gold schema dumps (Section 3) and commit.
3. For an existing company, apply schema changes with **migrations** (not `--schema-only`
   replace). Recommended: add idempotent `CREATE TABLE IF NOT EXISTS` / `ALTER TABLE` steps to
   `backend/index.js` migrations (the app already runs these on boot) or use a migration tool.
4. Pull latest image/code on the company host and `docker compose -p companyA up -d`.

> Never set `DB_SYNC_FORCE=true` in production — it drops tables.

---

## 11. Scaling to Many Companies (A–Z)

The per-company isolated model holds for any number of companies. At A–Z scale (26+
instances) you add **orchestration/automation** on top — the per-company steps in
`steps.md` do not change, only the layer around them.

### 11.1 Two topologies

**A. Compose on shared host(s) — simplest**
- One host (or small pool) runs 26 Compose projects: `docker compose -p companyA … -p companyZ up -d`.
- Each project gets its own containers, volumes and network; DB is per company.
- Automate rollout with a loop / Ansible playbook / a `deploy.sh <company>` wrapper.
- Good for a few dozen companies, but it is a **single point of failure** and has resource
  contention.

**B. Kubernetes — recommended at A–Z scale (enterprise)**
- **One namespace per company** (`company-a` … `company-z`): full isolation, quotas, network
  policies.
- Same app deployed via **one Helm chart / Kustomize** to every namespace, pinned to a version
  tag.
- **Postgres per company** via an operator (CloudNativePG) or a per-namespace StatefulSet —
  **never** a shared DB.
- **GitOps** (Argo CD / Flux): bump the image tag once → it rolls out to all 26 namespaces;
  canary a few first, then the rest.
- The app is stateless (session in DB/cookie), so it scales horizontally behind the ingress.

### 11.2 What stays identical for every company
- The `steps.md` flow (empty DB via `RESTORE_MODE=none` or `schema`, Create Company, HR users,
  master data).
- The code/image — same tag everywhere.

### 11.3 What differs per company (config only, never code)
| Per-company | Where |
|---|---|
| Domain / subdomain | Ingress / nginx |
| Secrets (DB password, session secret) | Sealed Secrets / External Secrets / `.env` |
| DB connection | per-namespace Secret |
| Restore mode | `none` or `schema` |

### 11.4 Networking & TLS
- **Wildcard TLS** for `*.erp.example.com`; Ingress routes `company-a.erp.example.com` → its
  namespace (frontend + `/api` → backend).
- HTTP→HTTPS redirect + HSTS at the ingress.
- Frontend is stateless and identical — one build artifact served to all; it points to each
  company's API via its subdomain.

### 11.5 Updates across A–Z
1. Merge fix → tag `v1.5.0` → CI builds `erp:1.5.0`.
2. GitOps updates the chart's image tag; Argo CD/Flux syncs all 26 namespaces.
3. Boot migrations alter each company's DB automatically (no data touched).
4. Canary: roll `company-a` + `company-b` first, verify, then the rest.

### 11.6 Backups
- Per-company CronJob (or operator) dumps `hrdb` + `erpdb` to object storage with retention →
  26 independent backups.

### 11.7 Sizing reality check
- 26 companies ≈ 26 × (backend + frontend + db + proxy) ≈ 100+ containers. Right-size nodes,
  set per-namespace CPU/memory quotas, and consider managed Postgres to offload DB ops.

> **Bottom line:** one repo + one image + 26 isolated deployments. At A–Z scale run them as
> **Kubernetes namespaces with GitOps**, not manual Compose.

---

## 12. Security Notes (enterprise)

- All HR/ERP API routes are protected by `requireAuth` (session). Public only: login, logout,
  password recovery, and read-only company branding.
- First-run company creation is public by design (initial setup); subsequent company-setting
  updates require login.
- Keep `SESSION_SECRET` unique and long; rotate periodically.
- Enforce HTTPS; set session cookie `Secure` + appropriate `SameSite`.
- Rate limiting is applied globally (`apiLimiter`) with stricter limits on auth/user routes.
- Secrets (DB password, session secret) must come from env/secret manager — never committed.

---

## 13. Deploying to Production (`main`) — dev → prod promotion

You have been running `dev`. Promoting to `main` (production) reuses the same per-company
steps, with **production hardening** and a clean separation from dev.

### 13.1 Promote the code
1. Merge `dev` → `main` and tag a release: `git tag v1.0.0 && git push --tags`.
2. Build the production image (backend + **frontend production build**), push to a registry:
   ```bash
   docker compose build
   docker compose push          # erp:1.0.0
   ```
   > The default `frontend` service runs the Vite **dev** server. For `main`, build the
   > front-end for production (`npm run build`) and serve `dist/` via `nginx` (or use
   > `npm run preview`). Do not run the Vite dev server in production.

### 13.2 Production environment files (per company on the prod server)
`backend/.env` — use **real** values, not dev defaults:
```ini
DB_SYNC_FORCE=false
SESSION_SECRET=<long-random-production-secret>
COOKIE_SECURE=true
COOKIE_SAME_SITE=none
CORS_ORIGIN=https://erp.companyA.com
DB_PASSWORD=<strong>
ERP_DB_PASSWORD=<strong>
```
`frontend/.env.production`:
```ini
VITE_API_URL=https://erp.companyA.com
```

### 13.3 Deploy
On the production server, in the company folder checked out at `main`:
```bash
docker compose pull                 # get erp:1.0.0 from registry
docker compose -p companyA up -d
```
- **Fresh prod DB:** set `RESTORE_MODE=none` (app builds empty tables) or `schema`.
- **Keeping existing data:** do **not** set `RESTORE_MODE=full` (that restores sample data);
  keep the existing database and just redeploy — boot migrations update the schema safely.

### 13.4 First run vs existing
- New production DB → open the app → **Create Company** (first-run setup).
- Existing DB → company already configured; just verify login works.

### 13.5 Verify & operate
- [ ] HTTPS terminated; HTTP→HTTPS redirect; HSTS.
- [ ] Login works; company letterhead correct; no dummy "ABC Company".
- [ ] API returns 401 without a session (auth enforced).
- [ ] Daily DB backup job running (Section 9).
- [ ] Monitoring/healthcheck (`/`) green.

### 13.6 Dev vs Main — key differences
| Area | dev | main (prod) |
|---|---|---|
| Frontend | Vite dev server | production build served by nginx |
| Cookies | `COOKIE_SECURE=false` | `COOKIE_SECURE=true` (HTTPS) |
| Secrets | throwaway | strong, unique, from secret manager |
| DB | dev data | separate prod DB, `DB_SYNC_FORCE=false` |
| Build | local `--build` | image from registry, `pull` + `up` |
| Backup | optional | mandatory, off-host |

> Rule: **never reuse the dev database for main.** Main gets its own DB (empty or restored
> from a proper backup), its own secrets, and its own domain.

---

## Quick Reference

| Task | Command |
|---|---|
| Empty-schema dump (gold) | `docker exec hr_postgres pg_dump -U postgres -Fc --schema-only hrdb -f /pg_backup/hrdb_schema.dump` |
| Deploy company (empty DB) | `RESTORE_MODE=schema docker compose -p companyA up -d --build` |
| Deploy company (sample data) | `docker compose -p companyA up -d --build` (default `full`) |
| Deploy (sync-only, no restore) | `RESTORE_MODE=none docker compose -p companyA up -d --build` |
| Verify empty | `psql -d hrdb -c 'SELECT COUNT(*) FROM "EmployeeMaster";'  -- > 0` |
| Daily backup | `pg_dump -Fc hrdb …` (see Section 9) |

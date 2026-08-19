# Steps to Deploy This ERP (Beginner Friendly)

This explains the **simple and easiest** way to run this ERP for **2 or 3 companies** on one
machine. Each company gets its **own separate copy** of the app and its own database — they
do not share data. Adding a 4th, 5th… company later is the same few steps again.

> Think of it like this: the app is one recipe. Each company is a fresh bowl made from that
> recipe. Changing the recipe once updates every bowl when you re-make it.

---

## What you need
- A computer/server with **Docker** installed (Docker Desktop on Windows/Mac, or Docker Engine on Linux).
- The project code downloaded (a folder like `C:\erp`).
- Basic terminal use (PowerShell on Windows, or Git Bash — both work the same here).

---

## Big picture (2–3 companies)
```
C:\erp\companyA   <- company A's files + its own database
C:\erp\companyB   <- company B's files + its own database
C:\erp\companyC   <- company C's files + its own database
```
Each folder is deployed separately with a **unique name** (`companyA`, `companyB`, `companyC`)
so Docker keeps their containers and data apart.

---

## Deploy your FIRST company (Company A)

### Step 1 — Download the code into a company folder
```bash
git clone <repo> C:\erp\companyA
cd C:\erp\companyA
```

### Step 2 — Set the backend settings
Make a file `backend\.env` (copy `backend\.env.example` and edit). Keep it simple:
```ini
DB_SYNC_FORCE=false
SESSION_SECRET=change-this-to-anything-random
COOKIE_SECURE=false
```
*(`COOKIE_SECURE=false` is fine for local/test. Set `true` when you have HTTPS.)*

### Step 3 — Set the frontend setting
Make a file `frontend\.env.production`:
```ini
VITE_API_URL=
```
(Leave it empty — the app and website are served together.)

### Step 4 — Tell it to start empty
Make a file named `.env` in the **main folder** (`C:\erp\companyA\.env`):
```ini
RESTORE_MODE=none
```
This one line means: "start with empty tables, let the app build them." No extra files needed.

### Step 5 — Start it
```bash
docker compose -p companyA up -d --build
```
Wait a minute. The app is running.

### Step 6 — Open it and create the company
Open your browser to the address Docker shows (usually `http://localhost:5173` or the URL you
set). Because no company exists yet, you'll see a **"Create Company"** form. Fill in Company
Name and save. That's your Company A.

### Step 7 — Log in and add users
- Log in with `admin` / `AUCTOR`, and **change the password**.
- Go to **Settings → User Access** and add the HR people who will use it.

Done! Company A is live.

---

## Add a SECOND company (Company B)

Exactly the same steps, but a **new folder** and a **new name**.

### Step 1
```bash
git clone <repo> C:\erp\companyB
cd C:\erp\companyB
```

### Step 2–4
Repeat Steps 2–4 above (make the same three files). Use a **different** `SESSION_SECRET`.

### Step 5 — Start with a different name
```bash
docker compose -p companyB up -d --build
```
(The name `companyB` keeps this company's containers and data separate from `companyA`.)

### Step 6–7
Open the app, **Create Company**, log in, add users. Company B is live — separate from A.

---

## Add a THIRD company (Company C)
Same again:
```bash
git clone <repo> C:\erp\companyC
cd C:\erp\companyC
# make the 3 files (Steps 2-4)
docker compose -p companyC up -d --build
# open app -> Create Company -> log in -> add users
```

> To add any future company (D, E, …), just repeat these steps with a new folder name and a
> new `-p <name>`. That's it.

---

## How to update all companies when you change the app
When you fix or improve the code, update **each company** the same way:
```bash
cd C:\erp\companyA
git pull
docker compose -p companyA up -d --build

cd C:\erp\companyB
git pull
docker compose -p companyB up -d --build

cd C:\erp\companyC
git pull
docker compose -p companyC up -d --build
```
Each company's own data stays safe — only the app code updates. (Do one company first to test,
then the others.)

---

## What if each company is on a DIFFERENT server?
The steps are the **same** — you just run them on that company's own machine. Nothing is shared
between servers.

1. On **Server A**, do the full Steps 1–7 → Company A lives on Server A.
2. On **Server B**, do the full Steps 1–7 (new folder, new `-p name`) → Company B lives on Server B.
3. And so on for each server.

### Differences to note
- **Address:** open the app using that server's address, not `localhost`, e.g.
  `http://<server-B-ip>:5173` (or a domain like `https://erp.companyB.com`).
- **Domain/TLS (recommended for real use):** set a domain per server and turn on HTTPS:
  ```ini
  # backend/.env
  COOKIE_SECURE=true
  CORS_ORIGIN=https://erp.companyB.com
  ```
  ```ini
  # frontend/.env.production
  VITE_API_URL=https://erp.companyB.com
  ```
- **Build once, run everywhere (cleaner):** instead of `--build` on every server, build the
  image **one time**, push it to a registry (Docker Hub / private), then on each server just
  pull and run:
  ```bash
  # on your build machine (once):
  docker compose build
  docker compose push            # pushes erp:latest (or a version tag)

  # on each company server:
  docker compose pull
  docker compose -p companyX up -d
  ```
  This guarantees every server runs the *exact same* build.
- **Updates:** SSH into each server (or use a tool like Ansible/CI) and run the pull + up step.
  Each server's data stays on that server.
- **Backups:** each server backs up its own database independently.

> Summary: different servers = same steps, separate addresses, optionally one shared image from
> a registry. Companies never share data or servers.


cd C:\erp\companyB
git pull
docker compose -p companyB up -d --build

cd C:\erp\companyC
git pull
docker compose -p companyC up -d --build
```
Each company's own data stays safe — only the app code updates. (Do one company first to test,
then the others.)

---

## Quick checklist per company
- [ ] Own folder (`companyX`)
- [ ] `backend/.env` (DB_SYNC_FORCE=false, SESSION_SECRET)
- [ ] `frontend/.env.production` (VITE_API_URL=)
- [ ] Root `.env` (RESTORE_MODE=none)
- [ ] `docker compose -p companyX up -d --build`
- [ ] Open app → Create Company
- [ ] Log in → change password → add HR users

---

## Notes
- **RESTORE_MODE=none** = easiest (app builds empty tables). If you later add special database
  features, switch to `RESTORE_MODE=schema` (see `DOCUMENT.md`).
- Never set `DB_SYNC_FORCE=true` — it deletes tables.
- Each company's data lives in its own Docker volume; deleting one company's containers does
  not affect another.

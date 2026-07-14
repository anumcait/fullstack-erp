# ERP Demo — Deploy & Tear-Down Notes

Quick reference for spinning the fullstack ERP demo up and down on AWS EC2 via Terraform.
The stack: PostgreSQL (`hr_postgres`, DBs `hrdb` + `erpdb`) → Node backend → Python ML agent
→ Vite React frontend → nginx (port 80). Every fresh deploy auto-restores the **latest committed
database backup**, so the live data survives `terraform destroy` + `terraform apply`.

---

## 0. Prerequisites

- Terraform ≥ 1.x installed locally.
- An AWS CLI profile with permissions to create EC2 / EIP / security group / IAM (SSM role).
- Git access to `https://github.com/anumcait/fullstack-erp.git` (branch `dev`).
- The two canonical backups committed in the repo (do not delete):
  - `pg_backup/hrdb.backup`  (HR + ERP tables, latest payslips)
  - `pg_backup/erpdb.backup` (separate ERP DB)
- `terraform/` folder with `main.tf`, `variables.tf`, `outputs.tf`, `user-data.sh`.
- **Run `deploy.sh` from Git Bash / WSL** (NOT raw PowerShell). The script passes JSON to
  the AWS CLI; PowerShell strips the quotes and the calls fail. Git Bash preserves them.

> Deploy uses **`docker-compose.demo.yaml`** (nginx-only public port, `DB_HOST=db`,
> restores from `./pg_backup`). The original `docker-compose.yaml` is for local dev only —
> do NOT use it for deploy.

---

## 1. Spin up (apply)

From the `terraform/` directory:

```bash
cd terraform

# (optional) pin the branch / instance type / repo
# terraform.tfvars:
#   repo_url      = "github.com/anumcait/fullstack-erp.git"
#   repo_branch   = "dev"
#   instance_type = "t3.large"
#   compose_file  = "docker-compose.demo.yaml"

terraform init
terraform apply -auto-approve
```

What `terraform apply` builds:
- Ubuntu EC2 (`t3.large`, 50GB root volume) with an SSM role (no SSH key required).
- Security group: SSH (22) open to `0.0.0.0/0`, HTTP (80) open, all egress.
- Elastic IP attached to the instance.
- `user-data.sh` installs Docker, clones the repo at branch `dev`, and starts
  `erp-demo.service` (`docker compose -f docker-compose.demo.yaml up`).

Get the URL:

```bash
terraform output app_url      # http://<elastic-ip>
terraform output public_ip
```

### Wait time
First boot takes **~5–10 minutes**: Docker install + pulling 4 images (postgres,
backend build, python agent w/ torch/spacy/chromadb, frontend, nginx) + DB restore.
Watch progress from your machine via SSM (no SSH needed):

```bash
aws ssm start-session --target <instance-id>
sudo journalctl -u erp-demo.service -f
# or: sudo tail -f /var/log/erp-bootstrap.log
```

### Verify
- Open `http://<elastic-ip>` → ERP login screen.
- Login: **`1002` / `AUCTOR`** (other seeded users also work).
- `curl http://<elastic-ip>/api/company-settings` → `200`.

---

## 1b. Apply local code changes to the running instance (no full rebuild)

Once the instance is up, you can edit locally, commit, and push the changes to the
cloud **without** a `terraform destroy`/`apply` (which would rebuild the 9.77 GB python
agent image from scratch and take ~25 min). `deploy.sh update` pushes your local commits
to GitHub `dev`, then on the instance runs `git pull` + `docker compose build` (only the
images whose code changed are rebuilt; the agent image is cached and skipped unless you
touch its `requirements.txt`/code) + `systemctl restart erp-demo`.

```bash
# from the repo root, in Git Bash
./deploy.sh update      # or: ./deploy.sh apply
```

What it does, end to end:
1. Commits any uncommitted local changes (message: `chore: local changes for cloud apply`)
   and `git push -u origin dev`.
2. SSM into the instance and, in `/opt/erp-app`:
   - `git pull origin dev`
   - `DOCKER_BUILDKIT=0 docker compose -f docker-compose.demo.yaml build` (rebuilds changed services)
   - `systemctl restart erp-demo` (the service's `ExecStartPre` does `compose down`, then `up`)
3. Prints the app URL — run `./deploy.sh status` (or `./deploy.sh diag`) to confirm.

Notes:
- **DB data is preserved** across updates: `systemctl restart` does `compose down` *without*
  `-v`, so the `hr_db_data` volume (and the restored `hrdb`/`erpdb`) stays intact.
- Frontend/backend-only changes rebuild in a few minutes. Only editing the **agent**'s
  `requirements.txt` or code triggers a large agent-image rebuild (the pip layer is cached,
  so even that is much faster than the first boot).
- To update the **data** (not code), use the `backup` step (section 3) and then either
  redeploy or shell in and `compose down -v && up -d` after `git pull`.

---

## 2. How data is restored on every deploy

- `docker-compose.demo.yaml` mounts `./pg_backup` and `init-scripts/init-db.sh`
  into the `db` container's `/docker-entrypoint-initdb.d/01-init-db.sh`.
- On first DB start, `init-db.sh`:
  1. Waits for Postgres (`pg_isready`).
  2. **hrdb**: if `Users` table is empty → `pg_restore` `hrdb.backup`.
  3. **erpdb**: creates the DB if missing; if it has 0 tables → `pg_restore` `erpdb.backup`.
- Because the DB volume (`hr_db_data`) is an unnamed/anonymous volume recreated on
  `docker compose down -v`, a *fresh* instance always restores from the committed backups.
- A running instance that is only **stopped** (not destroyed) keeps its EBS data.

---

## 3. Update the demo data (push newer backup)

Data lives in the **user's local** docker-compose (`docker-compose.yaml` mounts
`./pg_restore:/pg_backup`, writable). To ship newer data to the demo:

1. On your local machine (db running via `docker-compose.yaml`):
   ```bash
   docker exec -t hr_postgres pg_dump -U postgres -Fc -f /pg_backup/hrdb.backup hrdb
   docker exec -t hr_postgres pg_dump -U postgres -Fc -f /pg_backup/erpdb.backup erpdb
   docker cp hr_postgres:/pg_backup/hrdb.backup ./pg_restore/hrdb.backup
   docker cp hr_postgres:/pg_backup/erpdb.backup ./pg_restore/erpdb.backup
   ```
2. Move into the repo's tracked folder and commit:
   ```bash
   cp pg_restore/hrdb.backup pg_backup/hrdb.backup
   cp pg_restore/erpdb.backup pg_backup/erpdb.backup
   git add pg_backup/
   git commit -m "Update demo DB backups"
   git push origin dev
   ```
3. Redeploy so the new backup is used:
   ```bash
   cd terraform
   terraform destroy -auto-approve
   terraform apply -auto-approve
   ```
   (or shell into the instance and `docker compose -f docker-compose.demo.yaml down -v && up -d`
   after `git pull`, to force a fresh restore from the new `pg_backup/`.)

---

## 4. Tear down (destroy) — stop billing

```bash
cd terraform
terraform destroy -auto-approve
```

This removes the EC2 instance, EIP, security group, and IAM role/profile. **No compute
cost continues.** The latest data is safe because it lives in the committed `pg_backup/`
backups, not on the destroyed instance.

### Pause without destroying — `stop` / `start` (recommended for cost-saving)

Use these instead of `destroy` when you just want to switch the demo off temporarily
and bring it back exactly as it was (same EIP, same DB data, cached images → fast start).

```bash
./deploy.sh stop     # stops the EC2 instance (compute billing stops)
./deploy.sh start    # starts it again; systemd auto-restarts Docker + the ERP stack
```

- `stop` calls `aws ec2 stop-instances`. The EBS root volume (50 GB, holds the built
  images + the `hr_db_data` DB volume) and the **EIP stay attached**, so the app returns
  at the **same URL** on `start` with data intact.
- `start` calls `aws ec2 start-instances`. On boot, `erp-demo.service` (enabled,
  `Restart=always`) runs `docker compose up`, so the stack is live in ~1–2 min — no
  rebuild needed (images are cached on the EBS volume).
- ⚠️ Use `stop`, **never** `down`/`terraform destroy`, if you want to keep state. `destroy`
  deletes the instance + EIP and you'd redeploy from scratch (≈25 min rebuild).

### Cost: stop vs destroy vs running (us-east-1 on-demand estimates)

| State            | EC2 compute (t3.large) | EBS 50 GB gp3 | EIP        | ~Monthly |
|------------------|------------------------|---------------|------------|----------|
| **Running 24/7** | ~$60 (730 h × $0.083/h) | ~$4           | free*      | **~$64** |
| **Stopped**      | $0                     | ~$4           | free*      | **~$4**  |
| **Destroyed**     | $0                     | $0            | $0 (released) | **~$0** |

\* EIP is free while attached to the (running **or** stopped) instance. If you
`destroy`, the EIP is released too, so there's no idle-EIP charge.

So **stopping instead of running saves ~$60/month**; the only ongoing cost is the
~$4/month EBS storage that preserves your images + database. **Destroying** drops that
last ~$4 but you lose the instance and must redeploy (rebuild the 9.77 GB agent image)
next time. The S3 Terraform state bucket (`erp-terraform-state-888577063211`) costs
pennies/month in all cases and is never touched by `stop`/`start`.

> These are estimates; confirm current prices in the AWS pricing calculator. Spot/Savings
> Plans would lower the running cost further.

---

## 5. Known caveats / TODO

- **HTTP only** — no HTTPS/TLS on nginx. Front the EIP with ACM + ALB or a reverse
  proxy before any non-demo use.
- **SSH `0.0.0.0/0` with no key** — lock `ssh_cidr` to your IP (`1.2.3.4/32`) for
  anything beyond a throwaway demo, or add a `key_name`.
- **Frontend speed** — the container currently runs `npm run dev` (Vite dev server
  behind nginx), which is slow. A production build (`vite build` + `vite preview`) was
  prototyped but reverted to keep the deploy known-good. Revisit when needed
  (note: `frontend/.env.production` has a stale `VITE_API_URL` — fix before prod build).
- **Backend sync** is safe (`{ force: false }`); set `DB_SYNC_FORCE=true` only for an
  explicit drop/recreate of tables.
- Session table is created by raw SQL on boot (connect-pg-simple v10 has no `.sync()`).

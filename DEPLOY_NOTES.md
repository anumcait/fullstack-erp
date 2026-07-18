# ERP Demo — Deploy & Tear-Down Notes

Quick reference for spinning the fullstack ERP demo up and down on AWS EC2 via Terraform.
The stack: PostgreSQL (`hr_postgres`, DBs `hrdb` + `erpdb`) → Node backend → Python ML agent
→ Vite React frontend → nginx (port 80). Every fresh deploy auto-restores the **database backups from S3**,
so the live data survives `terraform destroy` + `terraform apply`.

---

## 0. Prerequisites

- Terraform ≥ 1.x installed locally.
- An AWS CLI profile with permissions to create EC2 / EIP / security group / IAM (SSM, S3, ECR).
- Git access to `https://github.com/anumcait/fullstack-erp.git` (branch `dev`).
- Database backups uploaded/accessible in S3:
  - `hrdb.backup`  (HR + ERP tables, latest payslips)
  - `erpdb.backup` (separate ERP DB)
- `terraform/` folder with `main.tf`, `variables.tf`, `outputs.tf`, `user-data.sh`.
- **Run `deploy.sh` from Git Bash / WSL** (NOT raw PowerShell). The script passes JSON to
  the AWS CLI; PowerShell strips the quotes and the calls fail. Git Bash preserves them.

> Deploy uses **`docker-compose.demo.yaml`** (nginx-only public port, `DB_HOST=db`,
> pulls images from AWS ECR, and restores from S3 backups downloaded to `./pg_backup`).
> The original `docker-compose.yaml` is for local dev only — do NOT use it for deploy.

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

## 1b. Apply local code changes to the running instance (no full rebuild on EC2)

Once the instance is up, you can edit locally and push updates. `deploy.sh update` compiles/builds Docker images locally on your machine, tags and pushes them to AWS ECR, and then commands the EC2 host via SSM to pull these new images and run them.

```bash
# from the repo root, in Git Bash/WSL
./deploy.sh update      # or: ./deploy.sh apply
```

What it does, end to end:
1. Commits local changes (message: `chore: local changes for cloud apply`) and pushes codebase configurations to Git.
2. Authenticates local Docker to ECR, builds the services locally (`backend`, `agent`, `frontend`), and pushes them to AWS ECR.
3. SSM into the EC2 instance and runs:
   - `git pull` (to get latest configurations and Compose files).
   - ECR authentication and `docker compose pull`.
   - `systemctl restart erp-demo` (restarts the containers using the pulled ECR images).
4. Synchronizes and restores databases from S3 backups.

Notes:
- **No container build is executed on the EC2 instance** anymore, resulting in extremely fast deployments and low CPU overhead.
- **DB data is preserved** across updates unless you perform a database drop/restore.

---

## 2. How data is restored on every deploy

- Database backups are stored and retrieved from the created S3 bucket (`erp-db-backups-...`).
- During EC2 instance initialization (in `user-data.sh`) or on update, backups are downloaded from the S3 bucket to `/opt/erp-app/pg_backup/`.
- `docker-compose.demo.yaml` mounts `/opt/erp-app/pg_backup` into the database container, where `init-scripts/init-db.sh` restores them if the database is detected to be empty.

---

## 3. Update the demo data (push newer backup)

Data lives in the **user's local** docker-compose (`docker-compose.yaml` mounts `./pg_restore:/pg_backup`, writable). To ship newer data to the demo:

1. On your local machine (db running via `docker-compose.yaml`):
   ```bash
   docker exec -t hr_postgres pg_dump -U postgres -Fc -f /pg_backup/hrdb.backup hrdb
   docker exec -t hr_postgres pg_dump -U postgres -Fc -f /pg_backup/erpdb.backup erpdb
   docker cp hr_postgres:/pg_backup/hrdb.backup ./pg_restore/hrdb.backup
   docker cp hr_postgres:/pg_backup/erpdb.backup ./pg_restore/erpdb.backup
   ```
2. Trigger backup synchronization to S3:
   ```bash
   cp pg_restore/hrdb.backup pg_backup/hrdb.backup
   cp pg_restore/erpdb.backup pg_backup/erpdb.backup
   ./deploy.sh backup
   ```
   (This dumps files locally inside `pg_backup/` and uploads them to your AWS S3 backup bucket).
3. Update the running deployment:
   ```bash
   ./deploy.sh update
   ```
   (This updates the running instance and forces a restore of the new database backups from S3.)

---

## 4. Tear down (destroy) — stop billing

```bash
cd terraform
terraform destroy -auto-approve
```

This removes the EC2 instance, EIP, security group, and IAM role/profile. **No compute
cost continues.** The latest data is safe because it lives in S3, not on the destroyed instance.

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

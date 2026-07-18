# True $0 Cost — Stop/Start with Data Backup

## Cost Breakdown

| State | EC2 | EBS 50GB | EIP | Total |
|-------|-----|----------|-----|-------|
| **Running** | ~$60/mo | ~$5/mo | $0 | **~$65/mo** |
| **Stopped** | $0 | ~$5/mo | $0 | **~$5/mo** |
| **Destroyed** | $0 | $0 | $0 | **$0** |

Stopped still costs ~$5/mo because EBS persists. For true $0: destroy when not using, recreate when needed.

---

## Prerequisites

### 1. Create a backup S3 bucket (one-time, via AWS Console)

Create a bucket manually — NOT managed by terraform — so it survives `terraform destroy`:

```powershell
aws s3 mb s3://erp-backups-888577063211 --region us-east-1
```

Or create via AWS Console with name `erp-backups-888577063211`.

---

## Workflow

### Step 1: Backup database before destroy

```powershell
# SSH into EC2 via SSM (no key pair needed)
aws ssm start-session --target i-0143d546f5f7b1918

# Inside the EC2: dump both databases
docker exec hr_postgres pg_dump -U postgres hrdb > /tmp/hrdb.sql
docker exec hr_postgres pg_dump -U postgres erpdb > /tmp/erpdb.sql

# Upload to the backup bucket (not managed by terraform)
aws s3 cp /tmp/hrdb.sql s3://erp-backups-888577063211/hrdb.sql
aws s3 cp /tmp/erpdb.sql s3://erp-backups-888577063211/erpdb.sql

# Exit SSM session
exit
```

> **Tip:** The backup is now in the S3 bucket which is NOT managed by terraform, so it will never be destroyed by `terraform destroy`.

### Step 2: Destroy everything (true $0)

```powershell
terraform destroy
```

This destroys: EC2, EBS volume, EIP, security group, IAM role, S3 bucket (managed), ECR repos.  
The manual backup bucket `erp-backups-888577063211` and its contents are safe.

### Step 3: Recreate when needed

```powershell
terraform apply -var="instance_state=running"
```

This provisions a fresh EC2, EIP, security group, etc.

### Step 4: Restore database on the new instance

```powershell
aws ssm start-session --target <new-instance-id>

# Wait for docker-compose to be running
docker compose -f /opt/erp-app/docker-compose.demo.yaml ps

# Download backups from the manual bucket
aws s3 cp s3://erp-backups-888577063211/hrdb.sql /tmp/hrdb.sql
aws s3 cp s3://erp-backups-888577063211/erpdb.sql /tmp/erpdb.sql

# Restore into the running postgres container
docker exec -i hr_postgres psql -U postgres -d hrdb < /tmp/hrdb.sql
docker exec -i hr_postgres psql -U postgres -d erpdb < /tmp/erpdb.sql

exit
```

---

## Scripted Automation (one-command backup)

Create `backup.ps1` locally (run before `terraform destroy`):

```powershell
# backup.ps1
$INSTANCE_ID = (terraform output -raw instance_id)
aws ssm start-session --target $INSTANCE_ID --document-name AWS-StartInteractiveCommand --parameters '{"command": ["docker exec hr_postgres pg_dump -U postgres hrdb | aws s3 cp - s3://erp-backups-888577063211/hrdb.sql && docker exec hr_postgres pg_dump -U postgres erpdb | aws s3 cp - s3://erp-backups-888577063211/erpdb.sql"]}'
Write-Host "✅ Backup complete"
```

Create `restore.ps1` (run after `terraform apply`):

```powershell
# restore.ps1
$INSTANCE_ID = (terraform output -raw instance_id)

# Wait for the instance to boot and stack to start
Start-Sleep -Seconds 120

aws ssm start-session --target $INSTANCE_ID --document-name AWS-StartInteractiveCommand --parameters '{"command": ["aws s3 cp s3://erp-backups-888577063211/hrdb.sql - | docker exec -i hr_postgres psql -U postgres -d hrdb && aws s3 cp s3://erp-backups-888577063211/erpdb.sql - | docker exec -i hr_postgres psql -U postgres -d erpdb"]}'
Write-Host "✅ Restore complete"
```

---

---

## ⚠️ Important: First terraform apply will destroy old resources

Since I removed ECR repos and the old S3 bucket from the terraform config, the next `terraform apply` will **delete** these from AWS (they're empty so safe):

- `erp-db-backups-20260718050023597900000001` (S3 bucket — empty, confirmed)  
- 3 ECR repos (empty, no images pushed)

The EC2, EIP, security group, and IAM role stay untouched. The instance will be rebuilt from source on next start.

---

## Quick Reference

```powershell
# Start (pay ~$65/mo while running)
terraform apply -var="instance_state=running"

# Backup DB
.\backup.ps1

# Stop (pay ~$5/mo for EBS)
terraform apply -var="instance_state=stopped"

# Destroy (pay $0 — truly free)
terraform destroy

# Restore from scratch
terraform apply
.\restore.ps1
```

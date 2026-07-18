---
description: Run deployment management scripts for AWS ERP including up, down, update, backup, start, and stop
---

# Walkthrough Workflow for ERP Deployments

Use this workflow to guide your system deployment commands. All commands should be executed from the root of the project directory.

## 1. Local Database Backup
Dump the local PostgreSQL databases (`hrdb` and `erpdb`) from the local running Docker container into the `pg_backup/` directory, and upload them to AWS S3.
```bash
./deploy.sh backup
```

## 2. Infrastructure Setup (Apply/Up)
Bootstrap and spin up the complete AWS EC2 instance, associate the Elastic IP, and start the Docker container stack configuration.
```bash
./deploy.sh up
```

## 3. Sync and Update AWS (Sync local to AWS)
Build new Docker images locally on your machine, tag and push them to AWS ECR, upload local database backups to AWS S3, and trigger the remote EC2 instance via SSM to pull the new ECR container images and restore databases from S3 backups.
// turbo
```bash
./deploy.sh update
```

## 4. Pause EC2 Instance (Stop compute billing, keep volume/EIP)
Stop the running EC2 instance to prevent compute charges. The data disk volume and IP address will be preserved.
```bash
./deploy.sh stop
```

## 5. Resume Stopped EC2 Instance
Start the paused EC2 instance. The services will automatically start up via systemd inside the VM.
```bash
./deploy.sh start
```

## 6. Tear Down Infrastructure (Complete Destroy)
Destroy all AWS resources in the terraform stack (stops all charges completely).
```bash
./deploy.sh down
```

## 7. Status Check
Check the application's overall web health and print the cloud URL:
```bash
./deploy.sh status
```

## 8. View Diagnostics
Collect boot logs, container status, and service states on the EC2 instance:
```bash
./deploy.sh diag
```

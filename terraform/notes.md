# ERP Demo — AMI-based Deployment Guide

Custom AMI makes `terraform apply` boot the app in ~2 min instead of ~15 min.

## Create the AMI (one-time)

Do this once after the first `terraform apply` finishes and the app is running:

```bash
# Find your instance
INSTANCE_ID=$(terraform output -raw instance_id)

# Wait until the app responds (build is done)
until curl -sf http://$(terraform output -raw public_ip) >/dev/null; do sleep 10; done

# Create AMI (stops the instance briefly for consistency)
aws ec2 create-image \
  --instance-id "$INSTANCE_ID" \
  --name "erp-demo-$(date +%Y%m%d)" \
  --description "ERP demo with Docker + pre-built images" \
  --no-reboot \
  --output text --query ImageId

# Output: ami-xxxxxxxxxxxxx
```

**Wait ~5 min** for the AMI to reach `available` status:

```bash
aws ec2 wait image-available --image-ids ami-xxxxxxxxxxxxx
```

## Use the AMI

Copy the AMI ID and run:

```bash
terraform apply -var="ami_id=ami-xxxxxxxxxxxxx"
```

Or set it permanently in `terraform.tfvars`:

```hcl
ami_id = "ami-xxxxxxxxxxxxx"
```

## Update the AMI (when deps change)

If you add system dependencies (new apt packages, new Docker version), rebuild the AMI:

```bash
./refresh-ami.sh
```

This script:
1. Stops the instance
2. Creates a new AMI
3. Updates `terraform.tfvars` with the new AMI ID
4. Restarts the instance

## How it works

- **AMI** has: Docker, git, AWS CLI, Docker build cache pre-baked
- **user-data** only: git pull → docker build (cached, ~1 min) → start compose
- **GitHub Actions** pushes to ECR on code changes → SSM restart pulls updates
- **Destroy** ($0): `terraform destroy` removes everything

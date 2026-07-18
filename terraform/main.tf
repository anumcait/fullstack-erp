terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    # hostinger = {
    #   source  = "hostinger/hostinger"
    #   version = "~> 0.1.22"
    # }
    null = {
      source  = "hashicorp/null"
      version = "~> 3.0"
    }
  }

  # Shared remote state so the deploy can be driven from any machine/agent
  # without splitting the state file. Bucket is versioned for safety.
  backend "s3" {
    bucket = "erp-terraform-state-888577063211"
    key    = "erp-demo/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.region
}

# provider "hostinger" {
#   api_token = var.hostinger_api_token
# }

# ────────────── IAM (SSM access for key-less debugging) ──────────────
data "aws_iam_policy_document" "assume_ec2" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "erp_demo" {
  name               = "erp-demo-ssm-role"
  assume_role_policy = data.aws_iam_policy_document.assume_ec2.json
}

resource "aws_iam_role_policy_attachment" "erp_demo_ssm" {
  role       = aws_iam_role.erp_demo.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

# Allow EC2 to self-create AMI for fast subsequent boots
resource "aws_iam_role_policy" "erp_demo_ami" {
  name = "erp-demo-create-ami"
  role = aws_iam_role.erp_demo.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ec2:CreateImage", "ec2:CreateTags", "ec2:DescribeImages"]
        Resource = "*"
      },
    ]
  })
}
resource "aws_iam_instance_profile" "erp_demo" {
  name = "erp-demo-ssm-profile"
  role = aws_iam_role.erp_demo.name
}

# ────────────── Networking (default VPC) ──────────────
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "default-for-az"
    values = ["true"]
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  owners = ["099720109477"]
}

# Find latest custom AMI for fast boots (auto-created by EC2 after first build)
data "aws_ami_ids" "erp_demo_custom" {
  owners = ["self"]
  filter {
    name   = "name"
    values = ["erp-demo-*"]
  }
}

# ────────────── Security group ──────────────
resource "aws_security_group" "erp_demo" {
  name        = "erp-demo-sg"
  description = "ERP demo: SSH + HTTP"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_cidr
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "erp-demo-sg"
  }
}

data "aws_caller_identity" "current" {}

locals {
  has_custom_ami = length(data.aws_ami_ids.erp_demo_custom.ids) > 0
  ami_id = var.ami_id != null && var.ami_id != "" ? var.ami_id : (
    local.has_custom_ami ? data.aws_ami_ids.erp_demo_custom.ids[0] : data.aws_ami.ubuntu.id
  )
  app_url = "http://${aws_eip.this.public_ip}"
}

# ────────────── EC2 instance ──────────────
resource "aws_instance" "this" {
  ami                    = local.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
  iam_instance_profile   = aws_iam_instance_profile.erp_demo.name
  vpc_security_group_ids = [aws_security_group.erp_demo.id]
  subnet_id              = data.aws_subnets.default.ids[0]

  # GP3 root volume. Sized generously: the Python agent image pulls
  # full CUDA/torch wheels and the build needs headroom (20G filled up).
  root_block_device {
    volume_type = "gp3"
    volume_size = 50
    encrypted   = true
  }

  user_data = templatefile("${path.module}/user-data.sh", {
    repo_url     = var.github_token != "" ? "https://${var.github_token}@${var.repo_url}" : "https://${var.repo_url}"
    compose_file = var.compose_file
    repo_branch  = var.repo_branch
  })

  tags = {
    Name = "erp-demo"
  }
}

# ────────────── Elastic IP (stable address across stop/start) ──────────────
resource "aws_eip" "this" {
  domain = "vpc"
  tags = {
    Name = "erp-demo-eip"
  }
}

resource "aws_eip_association" "this" {
  allocation_id = aws_eip.this.id
  instance_id   = aws_instance.this.id
}

# ────────────── Start / Stop (keeps data, no destroy) ──────────────
resource "aws_ec2_instance_state" "this" {
  instance_id = aws_instance.this.id
  state       = var.instance_state
}


# ────────────── Hostinger DNS record (CNAME via API) ──────────────
resource "null_resource" "hostinger_dns" {
  count = var.hostinger_zone != "" && var.hostinger_subdomain != "" ? 1 : 0

  triggers = {
    zone        = var.hostinger_zone
    name        = var.hostinger_subdomain
    instance_id = aws_instance.this.id
    token       = var.hostinger_api_token
    ttl         = tostring(var.hostinger_ttl)
  }

  depends_on = [aws_eip_association.this]

  provisioner "local-exec" {
    interpreter = ["powershell.exe", "-Command"]
    command     = <<PSCMD
$token='${self.triggers.token}'
$zone='${self.triggers.zone}'
$name='${self.triggers.name}'
$instanceId='${self.triggers.instance_id}'
$ttl=${self.triggers.ttl}
Start-Sleep -Seconds 10
$dns=(aws ec2 describe-instances --instance-ids $instanceId --region us-east-1 --query "Reservations[0].Instances[0].PublicDnsName" --output text)
Write-Host "Resolved DNS: $dns"
foreach ($type in @("A","CNAME")) {
  $deleteBody="{`"filters`":[{`"name`":`"$name`",`"type`":`"$type`"}]}"
  try { Invoke-RestMethod -Uri "https://developers.hostinger.com/api/dns/v1/zones/$zone" -Method DELETE -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body $deleteBody -ErrorAction Stop | Out-Null } catch {}
}
$putBody="{`"zone`":[{`"name`":`"$name`",`"records`":[{`"content`":`"$dns`"}],`"type`":`"CNAME`",`"ttl`":$ttl}],`"overwrite`":true}"
try {
  Invoke-RestMethod -Uri "https://developers.hostinger.com/api/dns/v1/zones/$zone" -Method PUT -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body $putBody -ErrorAction Stop | Out-Null
  Write-Host "Hostinger DNS: CNAME $name.$zone -> $dns created"
} catch {
  Write-Warning "Hostinger DNS PUT failed: $_"
}
PSCMD
  }

  provisioner "local-exec" {
    when        = destroy
    interpreter = ["powershell.exe", "-Command"]
    command     = <<PSCMD
$token='${self.triggers.token}'
$zone='${self.triggers.zone}'
$name='${self.triggers.name}'
foreach ($type in @("CNAME","A")) {
  $body="{`"filters`":[{`"name`":`"$name`",`"type`":`"$type`"}]}"
  try {
    Invoke-RestMethod -Uri "https://developers.hostinger.com/api/dns/v1/zones/$zone" -Method DELETE -ContentType "application/json" -Headers @{Authorization="Bearer $token"} -Body $body -ErrorAction Stop | Out-Null
    Write-Host "Hostinger DNS: $type $name.$zone deleted"
  } catch {}
}
PSCMD
  }
}

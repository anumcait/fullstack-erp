terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
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
    values = ["ubuntu/images/hq/ubuntu-jammy-22.04-amd64-server-*"]
  }
  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
  owners = ["099720109477"]
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

# ────────────── EC2 instance ──────────────
resource "aws_instance" "this" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_name
  vpc_security_group_ids = [aws_security_group.erp_demo.id]
  subnet_id              = data.aws_subnets.default.ids[0]

  # GP3 root volume (data persists across stop/start).
  root_block_device {
    volume_type = "gp3"
    volume_size = 20
    encrypted   = true
  }

  user_data = templatefile("${path.module}/user-data.sh", {
    repo_url    = var.github_token != "" ? "https://${var.github_token}@${var.repo_url}" : "https://${var.repo_url}"
    compose_file = var.compose_file
  })

  tags = {
    Name = "erp-demo"
  }
}

# ────────────── Elastic IP (stable address across stop/start) ──────────────
resource "aws_eip" "this" {
  domain           = "vpc"
  instance         = aws_instance.this.id
  associate_with_private_ip = aws_instance.this.private_ip
  tags = {
    Name = "erp-demo-eip"
  }
}

# ────────────── Start / Stop (keeps data, no destroy) ──────────────
resource "aws_ec2_instance_state" "this" {
  instance_id = aws_instance.this.id
  state       = var.instance_state
}

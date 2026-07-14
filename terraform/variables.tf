variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type (t3.small recommended for the demo stack)"
  type        = string
  default     = "t3.small"
}

variable "key_name" {
  description = "Existing EC2 key pair name for SSH access (optional)"
  type        = string
  default     = null
}

variable "ssh_cidr" {
  description = "CIDR allowed to SSH (restrict to your IP, e.g. 1.2.3.4/32)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "repo_url" {
  description = "Git repo URL without scheme, e.g. github.com/user/repo.git"
  type        = string
  default     = "github.com/your-user/your-repo.git"
}

variable "github_token" {
  description = "GitHub token for private repos (leave empty for public)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "compose_file" {
  description = "Compose file to launch on the instance"
  type        = string
  default     = "docker-compose.demo.yaml"
}

variable "repo_branch" {
  description = "Git branch to clone (demo files live on dev)"
  type        = string
  default     = "dev"
}

# "running" to bring up, "stopped" to halt (data preserved on EBS).
variable "instance_state" {
  description = "Desired instance state: running or stopped"
  type        = string
  default     = "running"
  validation {
    condition     = contains(["running", "stopped"], var.instance_state)
    error_message = "instance_state must be 'running' or 'stopped'."
  }
}

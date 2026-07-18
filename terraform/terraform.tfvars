# Terraform variables for the ERP demo deployment.
# Copy of the real values — overrides the placeholders in variables.tf.

region        = "us-east-1"
instance_type = "t3.large"

# Public repo (no token needed). Use https://<token>@github.com/... for private.
repo_url    = "github.com/anumcait/fullstack-erp.git"
repo_branch = "dev"

# Demo compose (nginx-only public port, restores from ./pg_backup).
compose_file = "docker-compose.demo.yaml"

# No SSH key (debug via SSM: aws ssm start-session --target <id>).
key_name = null

# Tighten this to your IP for anything beyond a throwaway demo, e.g. ["1.2.3.4/32"].
ssh_cidr = ["0.0.0.0/0"]

# Keep running; set "stopped" to halt compute while preserving EBS data.
instance_state = "running"

# Pin AMI to prevent auto-detection from replacing the instance
ami_id = "ami-09f3f0acf030a6270"

# Hostinger DNS Automation Configuration
hostinger_api_token = "UtjqflK7e6JfDotkJ0PcBymQhW0faWdLlEHs9lN5fa2e6955"
hostinger_zone      = "anushaengg.com"
hostinger_subdomain = "erp"
hostinger_ttl       = 300

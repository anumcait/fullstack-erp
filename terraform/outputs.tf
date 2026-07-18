output "public_ip" {
  description = "Public IP of the demo instance"
  value       = aws_instance.this.public_ip
}

output "app_url" {
  description = "URL to access the ERP demo"
  value       = local.app_url
}

output "instance_id" {
  description = "EC2 instance ID (for SSM debugging)"
  value       = aws_instance.this.id
}

output "ssh_command" {
  description = "SSH into the instance"
  value       = var.key_name != null ? "ssh -i <your-key.pem> ubuntu@${aws_instance.this.public_ip}" : "no key pair configured"
}

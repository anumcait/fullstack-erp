output "public_ip" {
  description = "Elastic IP of the demo instance"
  value       = aws_eip.this.public_ip
}

output "app_url" {
  description = "URL to access the ERP demo"
  value       = "http://${aws_eip.this.public_ip}"
}

output "ssh_command" {
  description = "SSH into the instance"
  value       = var.key_name != null ? "ssh -i <your-key.pem> ubuntu@${aws_eip.this.public_ip}" : "no key pair configured"
}

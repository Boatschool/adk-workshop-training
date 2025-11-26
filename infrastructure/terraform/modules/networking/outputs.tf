output "vpc_id" {
  description = "VPC network ID"
  value       = var.enable_private_network ? google_compute_network.vpc[0].id : null
}

output "vpc_name" {
  description = "VPC network name"
  value       = var.enable_private_network ? google_compute_network.vpc[0].name : null
}

output "subnet_id" {
  description = "Subnet ID"
  value       = var.enable_private_network ? google_compute_subnetwork.subnet[0].id : null
}

output "vpc_connector_name" {
  description = "VPC connector name for Cloud Run"
  value       = var.enable_private_network ? google_vpc_access_connector.connector[0].name : null
}

output "vpc_connector_id" {
  description = "VPC connector ID"
  value       = var.enable_private_network ? google_vpc_access_connector.connector[0].id : null
}

output "private_vpc_connection" {
  description = "Private VPC connection for Cloud SQL"
  value       = var.enable_private_network ? google_service_networking_connection.private_vpc_connection[0].network : null
}

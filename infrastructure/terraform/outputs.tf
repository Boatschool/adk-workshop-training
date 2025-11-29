# =============================================================================
# Networking Outputs
# =============================================================================
output "vpc_id" {
  description = "VPC network ID"
  value       = module.networking.vpc_id
}

output "vpc_connector_name" {
  description = "VPC connector name for Cloud Run"
  value       = module.networking.vpc_connector_name
}

# =============================================================================
# Cloud SQL Outputs
# =============================================================================
output "database_instance_name" {
  description = "Cloud SQL instance name"
  value       = module.cloud_sql.instance_name
}

output "database_connection_name" {
  description = "Cloud SQL connection name for Cloud Run"
  value       = local.db_connection_name
}

output "database_ip" {
  description = "Cloud SQL instance IP address"
  value       = module.cloud_sql.instance_ip
  sensitive   = true
}

output "database_name" {
  description = "Database name"
  value       = module.cloud_sql.database_name
}

# =============================================================================
# Secret Manager Outputs
# =============================================================================
output "secret_ids" {
  description = "Map of secret names to their IDs"
  value       = module.secret_manager.secret_ids
}

# =============================================================================
# Cloud Storage Outputs
# =============================================================================
output "storage_buckets" {
  description = "Map of bucket purposes to bucket names"
  value       = module.storage.bucket_names
}

# =============================================================================
# Cloud Run Outputs
# =============================================================================
output "cloud_run_url" {
  description = "Cloud Run service URL"
  value       = module.cloud_run.service_url
}

output "cloud_run_service_name" {
  description = "Cloud Run service name"
  value       = module.cloud_run.service_name
}

output "cloud_run_service_account" {
  description = "Cloud Run service account email"
  value       = module.cloud_run.service_account_email
}

# =============================================================================
# Load Balancer Outputs
# =============================================================================
output "frontend_ip" {
  description = "Static IP address for the frontend load balancer"
  value       = var.enable_load_balancer ? module.load_balancer[0].frontend_ip : null
}

output "frontend_url" {
  description = "Frontend URL (using custom domain if configured)"
  value       = var.enable_load_balancer && length(var.frontend_domains) > 0 ? "https://${var.frontend_domains[0]}" : (var.enable_load_balancer ? module.load_balancer[0].load_balancer_url : null)
}

output "load_balancer_ip_name" {
  description = "Name of the static IP address resource (for DNS configuration)"
  value       = var.enable_load_balancer ? module.load_balancer[0].frontend_ip_name : null
}

# =============================================================================
# Summary Output
# =============================================================================
output "deployment_summary" {
  description = "Summary of deployed resources"
  value = {
    project_id   = var.project_id
    region       = var.region
    environment  = var.environment
    api_url      = module.cloud_run.service_url
    frontend_url = var.enable_load_balancer && length(var.frontend_domains) > 0 ? "https://${var.frontend_domains[0]}" : null
    frontend_ip  = var.enable_load_balancer ? module.load_balancer[0].frontend_ip : null
    database     = module.cloud_sql.instance_name
    buckets      = module.storage.bucket_names
  }
}

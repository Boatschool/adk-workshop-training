output "instance_name" {
  description = "Cloud SQL instance name"
  value       = google_sql_database_instance.main.name
}

output "instance_connection_name" {
  description = "Cloud SQL connection name for Cloud Run"
  value       = google_sql_database_instance.main.connection_name
}

output "instance_ip" {
  description = "Cloud SQL instance IP address"
  value       = var.private_network_id != null ? google_sql_database_instance.main.private_ip_address : google_sql_database_instance.main.public_ip_address
  sensitive   = true
}

output "database_name" {
  description = "Database name"
  value       = google_sql_database.main.name
}

output "database_user" {
  description = "Database username"
  value       = google_sql_user.main.name
}

output "database_password_secret_id" {
  description = "Secret Manager ID for database password"
  value       = google_secret_manager_secret.db_password.secret_id
}

output "database_url_secret_id" {
  description = "Secret Manager ID for database URL"
  value       = google_secret_manager_secret.db_url.secret_id
}

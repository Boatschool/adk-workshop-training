output "secret_ids" {
  description = "Map of secret names to their full resource IDs"
  value = {
    for k, v in google_secret_manager_secret.secrets : k => v.id
  }
}

output "secret_names" {
  description = "Map of secret names to their secret_id"
  value = {
    for k, v in google_secret_manager_secret.secrets : k => v.secret_id
  }
}

output "jwt_secret_version" {
  description = "JWT secret version ID"
  value       = google_secret_manager_secret_version.jwt_secret.id
}

output "cicd_service_account_email" {
  description = "CI/CD service account email"
  value       = google_service_account.cicd.email
}

output "cicd_service_account_id" {
  description = "CI/CD service account ID"
  value       = google_service_account.cicd.id
}

output "workload_identity_pool_id" {
  description = "Workload Identity Pool ID for GitHub Actions"
  value       = var.enable_workload_identity ? google_iam_workload_identity_pool.github[0].workload_identity_pool_id : null
}

output "workload_identity_provider" {
  description = "Workload Identity Provider name for GitHub Actions"
  value       = var.enable_workload_identity ? google_iam_workload_identity_pool_provider.github[0].name : null
}

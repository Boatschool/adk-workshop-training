# Secret Manager Module - Application Secrets

# =============================================================================
# Secrets
# =============================================================================
resource "google_secret_manager_secret" "secrets" {
  for_each = var.secrets

  secret_id = "${var.name_prefix}-${each.key}"
  project   = var.project_id

  labels = merge(var.labels, {
    secret_name = each.key
  })

  replication {
    auto {}
  }
}

# =============================================================================
# JWT Secret Key (auto-generated)
# =============================================================================
resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

resource "google_secret_manager_secret_version" "jwt_secret" {
  secret      = google_secret_manager_secret.secrets["jwt-secret-key"].id
  secret_data = random_password.jwt_secret.result
}

# =============================================================================
# Placeholder versions for secrets that need manual population
# Note: These create empty versions - actual values set via gcloud CLI or Console
# =============================================================================

# The database-url secret is managed by the cloud_sql module
# The google-api-key needs to be set manually:
# gcloud secrets versions add adk-platform-dev-google-api-key --data-file=-

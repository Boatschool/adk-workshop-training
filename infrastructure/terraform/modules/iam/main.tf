# IAM Module - Service Account and Permissions

# =============================================================================
# Storage Access for Cloud Run (Per-Bucket - Least Privilege)
# SECURITY: Grant specific roles to specific buckets instead of project-wide admin
# =============================================================================

# Static bucket: Read-only access (serving static assets)
resource "google_storage_bucket_iam_member" "cloud_run_static_viewer" {
  bucket = var.bucket_names.static
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:${var.cloud_run_service_account}"
}

# Uploads bucket: Read/write access (user file uploads)
resource "google_storage_bucket_iam_member" "cloud_run_uploads_admin" {
  bucket = var.bucket_names.uploads
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${var.cloud_run_service_account}"
}

# Logs bucket: Write-only access (append logs, no delete)
resource "google_storage_bucket_iam_member" "cloud_run_logs_creator" {
  bucket = var.bucket_names.logs
  role   = "roles/storage.objectCreator"
  member = "serviceAccount:${var.cloud_run_service_account}"
}

# Backups bucket: NO direct access from Cloud Run
# Backups should be created by Cloud SQL or a dedicated backup service account

# =============================================================================
# Secret Manager Access for Cloud Run (Project-level)
# Note: Main access is granted in cloud_run module, this ensures coverage
# =============================================================================
# Project-level access is already granted in cloud_run module

# =============================================================================
# CI/CD Service Account (for GitHub Actions)
# =============================================================================
locals {
  # Truncate prefix to ensure service account name is <= 30 characters
  # Format: {truncated_prefix}-cicd (account_id has 30 char limit)
  cicd_account_id = substr("${var.name_prefix}-cicd", 0, 30)
}

resource "google_service_account" "cicd" {
  account_id   = local.cicd_account_id
  project      = var.project_id
  display_name = "CI/CD Service Account for ${var.name_prefix}"
  description  = "Service account used by GitHub Actions for deployments"
}

# CI/CD: Allow pushing to Artifact Registry
resource "google_project_iam_member" "cicd_artifact_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = "serviceAccount:${google_service_account.cicd.email}"
}

# CI/CD: Allow deploying to Cloud Run
resource "google_project_iam_member" "cicd_run_developer" {
  project = var.project_id
  role    = "roles/run.developer"
  member  = "serviceAccount:${google_service_account.cicd.email}"
}

# CI/CD: Allow acting as Cloud Run service account
resource "google_service_account_iam_member" "cicd_act_as_cloud_run" {
  service_account_id = "projects/${var.project_id}/serviceAccounts/${var.cloud_run_service_account}"
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.cicd.email}"
}

# CI/CD: Allow reading secrets (for CI tests)
resource "google_project_iam_member" "cicd_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cicd.email}"
}

# CI/CD: Allow running Cloud SQL migrations
resource "google_project_iam_member" "cicd_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cicd.email}"
}

# =============================================================================
# Workload Identity Federation for GitHub Actions (optional, more secure than keys)
# =============================================================================
resource "google_iam_workload_identity_pool" "github" {
  count = var.enable_workload_identity ? 1 : 0

  project                   = var.project_id
  workload_identity_pool_id = "${var.name_prefix}-github-pool"
  display_name              = "GitHub Actions Pool"
  description               = "Workload identity pool for GitHub Actions"
}

resource "google_iam_workload_identity_pool_provider" "github" {
  count = var.enable_workload_identity ? 1 : 0

  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.github[0].workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  display_name                       = "GitHub Actions Provider"

  attribute_mapping = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.repository" = "assertion.repository"
  }

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }

  attribute_condition = var.github_repo != "" ? "assertion.repository == '${var.github_repo}'" : null
}

resource "google_service_account_iam_member" "github_workload_identity" {
  count = var.enable_workload_identity ? 1 : 0

  service_account_id = google_service_account.cicd.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github[0].name}/attribute.repository/${var.github_repo}"
}

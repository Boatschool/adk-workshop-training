# Cloud Run Module - API Service Deployment

# =============================================================================
# Service Account for Cloud Run
# =============================================================================
resource "google_service_account" "cloud_run" {
  account_id   = "${var.name_prefix}-run-sa"
  project      = var.project_id
  display_name = "Cloud Run Service Account for ${var.name_prefix}"
  description  = "Service account used by Cloud Run to access GCP resources"
}

# =============================================================================
# Cloud Run Service
# =============================================================================
resource "google_cloud_run_v2_service" "api" {
  name     = "${var.name_prefix}-api"
  project  = var.project_id
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = google_service_account.cloud_run.email

    scaling {
      min_instance_count = var.min_instances
      max_instance_count = var.max_instances
    }

    # VPC connector for private networking
    dynamic "vpc_access" {
      for_each = var.vpc_connector != null ? [1] : []
      content {
        connector = var.vpc_connector
        egress    = "PRIVATE_RANGES_ONLY"
      }
    }

    containers {
      # Initial placeholder image - will be updated by CI/CD
      image = "us-docker.pkg.dev/cloudrun/container/hello"

      ports {
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = var.cpu
          memory = var.memory
        }
        cpu_idle = true # Allow CPU to be throttled when idle
      }

      # Environment variables
      env {
        name  = "ENVIRONMENT"
        value = var.environment
      }

      env {
        name  = "PROJECT_ID"
        value = var.project_id
      }

      env {
        name  = "REGION"
        value = var.region
      }

      # Secret references
      dynamic "env" {
        for_each = var.secret_references
        content {
          name = env.key
          value_source {
            secret_key_ref {
              secret  = env.value
              version = "latest"
            }
          }
        }
      }

      # Cloud SQL connection
      dynamic "volume_mounts" {
        for_each = var.db_connection_name != null ? [1] : []
        content {
          name       = "cloudsql"
          mount_path = "/cloudsql"
        }
      }

      # Startup probe
      startup_probe {
        http_get {
          path = "/health/"
        }
        initial_delay_seconds = 5
        period_seconds        = 10
        timeout_seconds       = 5
        failure_threshold     = 3
      }

      # Liveness probe
      liveness_probe {
        http_get {
          path = "/health/"
        }
        period_seconds    = 30
        timeout_seconds   = 5
        failure_threshold = 3
      }
    }

    # Cloud SQL sidecar
    dynamic "volumes" {
      for_each = var.db_connection_name != null ? [1] : []
      content {
        name = "cloudsql"
        cloud_sql_instance {
          instances = [var.db_connection_name]
        }
      }
    }

    max_instance_request_concurrency = var.concurrency
    timeout                          = "300s"

    labels = var.labels
  }

  traffic {
    type    = "TRAFFIC_TARGET_ALLOCATION_TYPE_LATEST"
    percent = 100
  }

  labels = var.labels

  lifecycle {
    ignore_changes = [
      template[0].containers[0].image, # Image is managed by CI/CD
      client,
      client_version,
    ]
  }
}

# =============================================================================
# IAM - Allow unauthenticated access (public API)
# =============================================================================
resource "google_cloud_run_v2_service_iam_member" "public_access" {
  count = var.allow_unauthenticated ? 1 : 0

  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# =============================================================================
# Cloud Run Service Account IAM Bindings
# =============================================================================

# Allow Cloud Run SA to access Secret Manager
resource "google_project_iam_member" "cloud_run_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# Allow Cloud Run SA to connect to Cloud SQL
resource "google_project_iam_member" "cloud_run_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# Allow Cloud Run SA to write logs
resource "google_project_iam_member" "cloud_run_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# Allow Cloud Run SA to write metrics
resource "google_project_iam_member" "cloud_run_metric_writer" {
  project = var.project_id
  role    = "roles/monitoring.metricWriter"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

# Allow Cloud Run SA to write traces
resource "google_project_iam_member" "cloud_run_trace_agent" {
  project = var.project_id
  role    = "roles/cloudtrace.agent"
  member  = "serviceAccount:${google_service_account.cloud_run.email}"
}

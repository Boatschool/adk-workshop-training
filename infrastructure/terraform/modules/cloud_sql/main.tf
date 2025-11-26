# Cloud SQL Module - PostgreSQL Database

# =============================================================================
# Random suffix for unique instance naming
# =============================================================================
resource "random_id" "db_suffix" {
  byte_length = 4
}

# =============================================================================
# Cloud SQL Instance (PostgreSQL 15)
# =============================================================================
resource "google_sql_database_instance" "main" {
  name             = "${var.name_prefix}-db-${random_id.db_suffix.hex}"
  project          = var.project_id
  region           = var.region
  database_version = "POSTGRES_15"

  # Prevent accidental deletion in production
  deletion_protection = var.environment == "production" ? true : false

  settings {
    tier              = var.tier
    availability_type = var.high_availability ? "REGIONAL" : "ZONAL"
    disk_autoresize   = true
    disk_size         = var.disk_size
    disk_type         = "PD_SSD"

    # Backup configuration
    backup_configuration {
      enabled                        = var.enable_backup
      point_in_time_recovery_enabled = var.enable_backup && var.environment == "production"
      start_time                     = "03:00"
      transaction_log_retention_days = var.environment == "production" ? 7 : 1

      backup_retention_settings {
        retained_backups = var.environment == "production" ? 14 : 7
        retention_unit   = "COUNT"
      }
    }

    # IP configuration
    ip_configuration {
      ipv4_enabled    = var.private_network_id == null ? true : false
      private_network = var.private_network_id
      ssl_mode        = "ENCRYPTED_ONLY"

      # Allow Cloud Run and local development (non-production only)
      dynamic "authorized_networks" {
        for_each = var.private_network_id == null && var.environment != "production" ? [1] : []
        content {
          name  = "allow-all-dev"
          value = "0.0.0.0/0"
        }
      }
    }

    # Maintenance window
    maintenance_window {
      day          = 7 # Sunday
      hour         = 3 # 3 AM
      update_track = "stable"
    }

    # Database flags for performance
    database_flags {
      name  = "max_connections"
      value = "100"
    }

    database_flags {
      name  = "log_checkpoints"
      value = "on"
    }

    database_flags {
      name  = "log_connections"
      value = "on"
    }

    database_flags {
      name  = "log_disconnections"
      value = "on"
    }

    database_flags {
      name  = "log_lock_waits"
      value = "on"
    }

    # Insights for query performance
    insights_config {
      query_insights_enabled  = true
      query_plans_per_minute  = 5
      query_string_length     = 1024
      record_application_tags = true
      record_client_address   = true
    }

    user_labels = var.labels
  }

  lifecycle {
    prevent_destroy = false # Set to true for production
  }
}

# =============================================================================
# Database
# =============================================================================
resource "google_sql_database" "main" {
  name     = "adk_platform"
  project  = var.project_id
  instance = google_sql_database_instance.main.name
  charset  = "UTF8"
}

# =============================================================================
# Database User
# =============================================================================
resource "random_password" "db_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

resource "google_sql_user" "main" {
  name     = "adk_user"
  project  = var.project_id
  instance = google_sql_database_instance.main.name
  password = random_password.db_password.result

  deletion_policy = "ABANDON"
}

# =============================================================================
# Store password in Secret Manager
# =============================================================================
resource "google_secret_manager_secret" "db_password" {
  secret_id = "${var.name_prefix}-db-password"
  project   = var.project_id

  labels = var.labels

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = random_password.db_password.result
}

# Store full connection URL
resource "google_secret_manager_secret" "db_url" {
  secret_id = "${var.name_prefix}-database-url"
  project   = var.project_id

  labels = var.labels

  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_url" {
  secret = google_secret_manager_secret.db_url.id
  secret_data = var.private_network_id != null ? (
    "postgresql+asyncpg://${google_sql_user.main.name}:${random_password.db_password.result}@${google_sql_database_instance.main.private_ip_address}:5432/${google_sql_database.main.name}"
  ) : (
    "postgresql+asyncpg://${google_sql_user.main.name}:${random_password.db_password.result}@/${google_sql_database.main.name}?host=/cloudsql/${var.project_id}:${var.region}:${google_sql_database_instance.main.name}"
  )
}

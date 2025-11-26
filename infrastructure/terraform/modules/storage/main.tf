# Cloud Storage Module - Object Storage Buckets

# =============================================================================
# Random suffix for globally unique bucket names
# =============================================================================
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

locals {
  bucket_suffix = random_id.bucket_suffix.hex
}

# =============================================================================
# Static Assets Bucket (Frontend files, CSS, JS, images)
# =============================================================================
resource "google_storage_bucket" "static" {
  name          = "${var.name_prefix}-static-${local.bucket_suffix}"
  project       = var.project_id
  location      = var.region
  storage_class = "STANDARD"

  uniform_bucket_level_access = true

  # Enable versioning for safety
  versioning {
    enabled = true
  }

  # CORS configuration for frontend access
  # SECURITY: Use cors_origins variable to restrict allowed origins per environment
  cors {
    origin          = var.cors_origins
    method          = ["GET", "HEAD"]
    response_header = ["Content-Type", "Cache-Control"]
    max_age_seconds = 3600
  }

  # Lifecycle rules
  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      num_newer_versions = 5
    }
  }

  labels = var.labels
}

# Make static bucket publicly readable (for static assets)
resource "google_storage_bucket_iam_member" "static_public_read" {
  count  = var.environment != "production" ? 1 : 0 # Only in non-prod
  bucket = google_storage_bucket.static.name
  role   = "roles/storage.objectViewer"
  member = "allUsers"
}

# =============================================================================
# Uploads Bucket (User-generated content, agent configs)
# =============================================================================
resource "google_storage_bucket" "uploads" {
  name          = "${var.name_prefix}-uploads-${local.bucket_suffix}"
  project       = var.project_id
  location      = var.region
  storage_class = "STANDARD"

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  # Delete old versions after 90 days
  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      days_since_noncurrent_time = 90
    }
  }

  # Move old uploads to nearline after 30 days
  lifecycle_rule {
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
    condition {
      age = 30
    }
  }

  labels = var.labels
}

# =============================================================================
# Logs Bucket (Agent execution logs, audit logs)
# =============================================================================
resource "google_storage_bucket" "logs" {
  name          = "${var.name_prefix}-logs-${local.bucket_suffix}"
  project       = var.project_id
  location      = var.region
  storage_class = "STANDARD"

  uniform_bucket_level_access = true

  # Lifecycle rules for log retention
  lifecycle_rule {
    action {
      type          = "SetStorageClass"
      storage_class = "NEARLINE"
    }
    condition {
      age = 30
    }
  }

  lifecycle_rule {
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
    condition {
      age = 90
    }
  }

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = var.environment == "production" ? 365 : 90
    }
  }

  labels = var.labels
}

# =============================================================================
# Backups Bucket (Database backups, configuration backups)
# =============================================================================
resource "google_storage_bucket" "backups" {
  name          = "${var.name_prefix}-backups-${local.bucket_suffix}"
  project       = var.project_id
  location      = var.region
  storage_class = "NEARLINE"

  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  # Keep backups for retention period
  lifecycle_rule {
    action {
      type          = "SetStorageClass"
      storage_class = "COLDLINE"
    }
    condition {
      age = 30
    }
  }

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = var.environment == "production" ? 365 : 30
    }
  }

  labels = var.labels
}

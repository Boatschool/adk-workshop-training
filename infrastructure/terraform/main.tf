# ADK Platform - Main Terraform Configuration
# This file orchestrates all infrastructure modules for the ADK Platform

locals {
  # Common naming convention
  name_prefix = "${var.app_name}-${var.environment}"

  # Common labels for all resources
  common_labels = merge(var.labels, {
    app         = var.app_name
    environment = var.environment
    managed_by  = "terraform"
  })

  # Database connection name format
  db_connection_name = "${var.project_id}:${var.region}:${module.cloud_sql.instance_name}"
}

# =============================================================================
# Networking Module
# =============================================================================
module "networking" {
  source = "./modules/networking"

  project_id             = var.project_id
  region                 = var.region
  name_prefix            = local.name_prefix
  environment            = var.environment
  enable_private_network = var.enable_private_networking
  labels                 = local.common_labels
}

# =============================================================================
# Cloud SQL Module (PostgreSQL)
# =============================================================================
module "cloud_sql" {
  source = "./modules/cloud_sql"

  project_id          = var.project_id
  region              = var.region
  name_prefix         = local.name_prefix
  environment         = var.environment
  tier                = var.db_tier
  disk_size           = var.db_disk_size
  high_availability   = var.db_high_availability
  enable_backup       = var.db_enable_backup
  private_network_id  = var.enable_private_networking ? module.networking.vpc_id : null
  authorized_networks = var.db_authorized_networks
  labels              = local.common_labels

  depends_on = [module.networking]
}

# =============================================================================
# Secret Manager Module
# =============================================================================
module "secret_manager" {
  source = "./modules/secret_manager"

  project_id  = var.project_id
  name_prefix = local.name_prefix
  environment = var.environment
  labels      = local.common_labels

  # Secrets to create (values set via gcloud or console)
  secrets = {
    "database-url"     = "Database connection URL"
    "jwt-secret-key"   = "JWT signing secret key"
    "google-api-key"   = "Google API key for ADK"
  }
}

# =============================================================================
# Cloud Storage Module
# =============================================================================
module "storage" {
  source = "./modules/storage"

  project_id   = var.project_id
  region       = var.region
  name_prefix  = local.name_prefix
  environment  = var.environment
  labels       = local.common_labels
  cors_origins = var.static_cors_origins
}

# =============================================================================
# IAM Module
# =============================================================================
module "iam" {
  source = "./modules/iam"

  project_id  = var.project_id
  name_prefix = local.name_prefix
  environment = var.environment

  # Grant Cloud Run service account access to specific buckets (least privilege)
  cloud_run_service_account = module.cloud_run.service_account_email
  bucket_names              = module.storage.bucket_names

  depends_on = [module.cloud_run, module.storage]
}

# =============================================================================
# Cloud Run Module (API Service)
# =============================================================================
module "cloud_run" {
  source = "./modules/cloud_run"

  project_id       = var.project_id
  region           = var.region
  name_prefix      = local.name_prefix
  environment      = var.environment
  min_instances    = var.cloud_run_min_instances
  max_instances    = var.cloud_run_max_instances
  cpu              = var.cloud_run_cpu
  memory           = var.cloud_run_memory
  concurrency      = var.cloud_run_concurrency
  labels           = local.common_labels

  # SECURITY: Explicitly control public access - only for dev/staging APIs
  # Production should use IAP or require authentication
  allow_unauthenticated = var.allow_unauthenticated_api

  # VPC connector for private networking (if enabled)
  vpc_connector = var.enable_private_networking ? module.networking.vpc_connector_id : null

  # Database connection
  db_connection_name = local.db_connection_name

  # Secret references
  secret_references = {
    DATABASE_URL   = module.secret_manager.secret_ids["database-url"]
    SECRET_KEY     = module.secret_manager.secret_ids["jwt-secret-key"]
    GOOGLE_API_KEY = module.secret_manager.secret_ids["google-api-key"]
  }

  depends_on = [module.cloud_sql, module.secret_manager, module.networking]
}

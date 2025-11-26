# Production Environment Configuration
# Usage: terraform plan -var-file=environments/production/terraform.tfvars

project_id  = "adk-workshop-1763490866"
region      = "us-central1"
environment = "production"
app_name    = "adk-platform"

# Database - production grade
db_tier              = "db-custom-4-16384" # 4 vCPU, 16GB RAM
db_disk_size         = 100
db_high_availability = true
db_enable_backup     = true

# Cloud Run - production scale
cloud_run_min_instances = 2
cloud_run_max_instances = 100
cloud_run_cpu           = "2"
cloud_run_memory        = "2Gi"
cloud_run_concurrency   = 100

# Networking - private networking for production
enable_private_networking = true

# Security - NEVER allow unauthenticated access in production (use IAP)
allow_unauthenticated_api = false

# CORS - restrict to production domain(s) only
# TODO: Update with actual production domain(s) when configured
static_cors_origins = [
  "https://adk-platform.example.com",
  "https://www.adk-platform.example.com"
]

# Database authorized networks - empty by default (private VPC provides access)
# SECURITY: Avoid direct database access in production; use Cloud SQL Proxy or VPC
# db_authorized_networks = []

# Labels
labels = {
  team        = "platform"
  cost_center = "production"
}

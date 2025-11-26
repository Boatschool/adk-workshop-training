# Development Environment Configuration
# Usage: terraform plan -var-file=environments/dev/terraform.tfvars

project_id  = "adk-workshop-1763490866"
region      = "us-central1"
environment = "dev"
app_name    = "adk-platform"

# Database - minimal for dev
db_tier              = "db-f1-micro"
db_disk_size         = 10
db_high_availability = false
db_enable_backup     = true

# Cloud Run - minimal for dev
cloud_run_min_instances = 0
cloud_run_max_instances = 5
cloud_run_cpu           = "1"
cloud_run_memory        = "512Mi"
cloud_run_concurrency   = 80

# Networking - public IP for dev (simpler)
enable_private_networking = false

# Labels
labels = {
  team        = "platform"
  cost_center = "development"
}

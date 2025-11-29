# Staging Environment Configuration
# Usage: terraform plan -var-file=environments/staging/terraform.tfvars

project_id  = "adk-workshop-1763490866"
region      = "us-central1"
environment = "staging"
app_name    = "adk-platform"

# Database - moderate for staging
db_tier              = "db-custom-2-4096" # 2 vCPU, 4GB RAM
db_disk_size         = 20
db_high_availability = false
db_enable_backup     = true

# Cloud Run - moderate for staging
cloud_run_min_instances = 1
cloud_run_max_instances = 10
cloud_run_cpu           = "1"
cloud_run_memory        = "1Gi"
cloud_run_concurrency   = 80

# Networking - private networking for staging
enable_private_networking = true

# Security - allow public access for user registration/login
# Application-level authentication (JWT) protects sensitive endpoints
allow_unauthenticated_api = true

# Database authorized networks - empty by default (private VPC provides access)
# Only needed if specific external CIDRs require direct access
# db_authorized_networks = [
#   { name = "ci-runner", cidr = "10.128.0.0/20" }
# ]

# Labels
labels = {
  team        = "platform"
  cost_center = "staging"
}

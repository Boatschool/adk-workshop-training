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

# Security - explicitly enable public access for dev API (testing/demos)
allow_unauthenticated_api = true

# Database authorized networks - empty by default, use Cloud SQL Proxy
# Uncomment and add specific CIDRs if direct access is needed (e.g., office IP)
# db_authorized_networks = [
#   { name = "office-network", cidr = "203.0.113.0/24" },
#   { name = "vpn-gateway", cidr = "198.51.100.10/32" }
# ]

# Labels
labels = {
  team        = "platform"
  cost_center = "development"
}

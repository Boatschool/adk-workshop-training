# Networking Module - VPC, Subnets, and VPC Connector for Cloud Run

# =============================================================================
# VPC Network
# =============================================================================
resource "google_compute_network" "vpc" {
  count = var.enable_private_network ? 1 : 0

  name                    = "${var.name_prefix}-vpc"
  project                 = var.project_id
  auto_create_subnetworks = false
  description             = "VPC network for ${var.name_prefix}"
}

# =============================================================================
# Subnet for Cloud Run VPC Connector
# =============================================================================
resource "google_compute_subnetwork" "subnet" {
  count = var.enable_private_network ? 1 : 0

  name          = "${var.name_prefix}-subnet"
  project       = var.project_id
  region        = var.region
  network       = google_compute_network.vpc[0].id
  ip_cidr_range = "10.0.0.0/24"

  private_ip_google_access = true

  log_config {
    aggregation_interval = "INTERVAL_5_SEC"
    flow_sampling        = 0.5
    metadata             = "INCLUDE_ALL_METADATA"
  }
}

# =============================================================================
# VPC Connector for Cloud Run (Serverless VPC Access)
# =============================================================================
resource "google_vpc_access_connector" "connector" {
  count = var.enable_private_network ? 1 : 0

  # VPC connector names must be <= 25 characters, so use abbreviated name
  name          = "adk-${var.environment}-conn"
  project       = var.project_id
  region        = var.region
  network       = google_compute_network.vpc[0].name
  ip_cidr_range = "10.8.0.0/28"

  min_instances = 2
  max_instances = 3

  machine_type = "e2-micro"
}

# =============================================================================
# Private Service Connection (for Cloud SQL private IP)
# =============================================================================
resource "google_compute_global_address" "private_ip_address" {
  count = var.enable_private_network ? 1 : 0

  name          = "${var.name_prefix}-private-ip"
  project       = var.project_id
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.vpc[0].id
}

resource "google_service_networking_connection" "private_vpc_connection" {
  count = var.enable_private_network ? 1 : 0

  network                 = google_compute_network.vpc[0].id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_ip_address[0].name]
}

# =============================================================================
# Firewall Rules
# =============================================================================
resource "google_compute_firewall" "allow_internal" {
  count = var.enable_private_network ? 1 : 0

  name    = "${var.name_prefix}-allow-internal"
  project = var.project_id
  network = google_compute_network.vpc[0].name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "udp"
    ports    = ["0-65535"]
  }

  allow {
    protocol = "icmp"
  }

  source_ranges = ["10.0.0.0/8"]
  description   = "Allow internal traffic within VPC"
}

resource "google_compute_firewall" "allow_health_checks" {
  count = var.enable_private_network ? 1 : 0

  name    = "${var.name_prefix}-allow-health-checks"
  project = var.project_id
  network = google_compute_network.vpc[0].name

  allow {
    protocol = "tcp"
    ports    = ["8080"]
  }

  # Google Cloud health check IP ranges
  source_ranges = ["35.191.0.0/16", "130.211.0.0/22"]
  description   = "Allow health checks from Google Cloud"
}

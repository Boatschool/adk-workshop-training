# Project Configuration
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region for resources"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment name (dev, staging, production)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production"
  }
}

# Naming
variable "app_name" {
  description = "Application name used for resource naming"
  type        = string
  default     = "adk-platform"
}

# Database Configuration
variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro" # Use db-custom-4-16384 for production
}

variable "db_disk_size" {
  description = "Cloud SQL disk size in GB"
  type        = number
  default     = 10
}

variable "db_high_availability" {
  description = "Enable high availability for Cloud SQL"
  type        = bool
  default     = false
}

variable "db_enable_backup" {
  description = "Enable automated backups for Cloud SQL"
  type        = bool
  default     = true
}

# Cloud Run Configuration
variable "cloud_run_min_instances" {
  description = "Minimum number of Cloud Run instances"
  type        = number
  default     = 0
}

variable "cloud_run_max_instances" {
  description = "Maximum number of Cloud Run instances"
  type        = number
  default     = 10
}

variable "cloud_run_cpu" {
  description = "CPU allocation for Cloud Run (e.g., '1', '2')"
  type        = string
  default     = "1"
}

variable "cloud_run_memory" {
  description = "Memory allocation for Cloud Run (e.g., '512Mi', '1Gi', '2Gi')"
  type        = string
  default     = "512Mi"
}

variable "cloud_run_concurrency" {
  description = "Maximum concurrent requests per Cloud Run instance"
  type        = number
  default     = 80
}

# Networking
variable "enable_private_networking" {
  description = "Enable private VPC networking for Cloud SQL"
  type        = bool
  default     = false # Set true for production
}

# Security
variable "allow_unauthenticated_api" {
  description = "Allow unauthenticated access to Cloud Run API. SECURITY: Defaults to false, enable only for public APIs."
  type        = bool
  default     = false
}

variable "static_cors_origins" {
  description = "Allowed CORS origins for static assets bucket. SECURITY: Restrict to your domain(s) in production."
  type        = list(string)
  default     = ["*"]
}

variable "db_authorized_networks" {
  description = "List of authorized networks for direct Cloud SQL access. SECURITY: Prefer Cloud SQL Proxy. Use only for specific trusted CIDRs."
  type = list(object({
    name = string
    cidr = string
  }))
  default = []
}

# Domain Configuration
variable "domain" {
  description = "Custom domain for the application (optional)"
  type        = string
  default     = ""
}

# Labels
variable "labels" {
  description = "Labels to apply to all resources"
  type        = map(string)
  default     = {}
}

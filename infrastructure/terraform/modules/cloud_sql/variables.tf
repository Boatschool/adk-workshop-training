variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
}

variable "name_prefix" {
  description = "Prefix for resource names"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-f1-micro"
}

variable "disk_size" {
  description = "Cloud SQL disk size in GB"
  type        = number
  default     = 10
}

variable "high_availability" {
  description = "Enable high availability"
  type        = bool
  default     = false
}

variable "enable_backup" {
  description = "Enable automated backups"
  type        = bool
  default     = true
}

variable "private_network_id" {
  description = "VPC network ID for private IP (null for public IP)"
  type        = string
  default     = null
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}

variable "authorized_networks" {
  description = "List of authorized networks for Cloud SQL access. SECURITY: Use sparingly, prefer Cloud SQL Proxy instead."
  type = list(object({
    name = string
    cidr = string
  }))
  default = []

  validation {
    condition = alltrue([
      for net in var.authorized_networks : can(regex("^([0-9]{1,3}\\.){3}[0-9]{1,3}/[0-9]{1,2}$", net.cidr))
    ])
    error_message = "All authorized_networks must have valid CIDR notation (e.g., 10.0.0.0/8)."
  }

  validation {
    condition = alltrue([
      for net in var.authorized_networks : net.cidr != "0.0.0.0/0"
    ])
    error_message = "SECURITY: 0.0.0.0/0 is not allowed. Use specific CIDR ranges or Cloud SQL Proxy."
  }
}

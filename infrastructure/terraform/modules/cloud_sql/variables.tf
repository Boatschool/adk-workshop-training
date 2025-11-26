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

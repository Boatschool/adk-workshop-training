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

variable "min_instances" {
  description = "Minimum number of instances"
  type        = number
  default     = 0
}

variable "max_instances" {
  description = "Maximum number of instances"
  type        = number
  default     = 10
}

variable "cpu" {
  description = "CPU allocation"
  type        = string
  default     = "1"
}

variable "memory" {
  description = "Memory allocation"
  type        = string
  default     = "512Mi"
}

variable "concurrency" {
  description = "Maximum concurrent requests per instance"
  type        = number
  default     = 80
}

variable "vpc_connector" {
  description = "VPC connector name for private networking"
  type        = string
  default     = null
}

variable "db_connection_name" {
  description = "Cloud SQL connection name"
  type        = string
  default     = null
}

variable "secret_references" {
  description = "Map of environment variable names to Secret Manager secret IDs"
  type        = map(string)
  default     = {}
}

variable "allow_unauthenticated" {
  description = "Allow unauthenticated access to the service. SECURITY: Defaults to false, opt-in only for public APIs."
  type        = bool
  default     = false
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}

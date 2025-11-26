variable "project_id" {
  description = "GCP Project ID"
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

variable "secrets" {
  description = "Map of secret names to descriptions"
  type        = map(string)
  default     = {}
}

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}

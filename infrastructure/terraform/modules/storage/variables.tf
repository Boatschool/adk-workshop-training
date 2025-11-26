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

variable "labels" {
  description = "Labels to apply to resources"
  type        = map(string)
  default     = {}
}

variable "cors_origins" {
  description = "Allowed CORS origins for static bucket. Defaults to ['*'] for dev, should be restricted for production."
  type        = list(string)
  default     = ["*"]
}

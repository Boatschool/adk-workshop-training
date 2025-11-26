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

variable "cloud_run_service_account" {
  description = "Cloud Run service account email"
  type        = string
}

variable "enable_workload_identity" {
  description = "Enable Workload Identity Federation for GitHub Actions"
  type        = bool
  default     = false
}

variable "github_repo" {
  description = "GitHub repository in format 'owner/repo' for Workload Identity"
  type        = string
  default     = ""
}

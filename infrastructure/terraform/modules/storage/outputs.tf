output "bucket_names" {
  description = "Map of bucket purposes to bucket names"
  value = {
    static  = google_storage_bucket.static.name
    uploads = google_storage_bucket.uploads.name
    logs    = google_storage_bucket.logs.name
    backups = google_storage_bucket.backups.name
  }
}

output "bucket_urls" {
  description = "Map of bucket purposes to bucket URLs"
  value = {
    static  = google_storage_bucket.static.url
    uploads = google_storage_bucket.uploads.url
    logs    = google_storage_bucket.logs.url
    backups = google_storage_bucket.backups.url
  }
}

output "static_bucket_name" {
  description = "Static assets bucket name"
  value       = google_storage_bucket.static.name
}

output "uploads_bucket_name" {
  description = "Uploads bucket name"
  value       = google_storage_bucket.uploads.name
}

output "logs_bucket_name" {
  description = "Logs bucket name"
  value       = google_storage_bucket.logs.name
}

output "backups_bucket_name" {
  description = "Backups bucket name"
  value       = google_storage_bucket.backups.name
}

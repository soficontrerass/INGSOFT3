variable "project_id" {
  description = "The ID of the Google Cloud project."
  type        = string
}

variable "region" {
  description = "The region where resources will be deployed."
  type        = string
  default     = "us-central1"
}

variable "cloud_run_service_name" {
  description = "The name of the Cloud Run service."
  type        = string
}

variable "cloud_sql_instance_name" {
  description = "The name of the Cloud SQL instance."
  type        = string
}

variable "gcs_backup_bucket" {
  description = "The name of the Google Cloud Storage bucket for backups."
  type        = string
}
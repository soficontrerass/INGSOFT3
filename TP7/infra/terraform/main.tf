terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

variable "project_id" { type = string }
variable "region"     { type = string }

# Placeholder resources: definir Cloud Run service, Cloud SQL, buckets según necesidad.
output "placeholder" {
  value = "TP6 terraform placeholder - fill with real resources"
}
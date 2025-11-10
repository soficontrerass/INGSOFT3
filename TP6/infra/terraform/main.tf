# Terraform configuration for TP6 project

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

resource "google_cloud_run_service" "tp6_service" {
  name     = "tp6-server"
  location = var.gcp_region

  template {
    spec {
      containers {
        image = var.container_image
        ports {
          container_port = 8080
        }
      }
    }
  }
}

resource "google_sql_database_instance" "tp6_sql" {
  name             = "tp6-sql-prod"
  database_version = "POSTGRES_13"
  region           = var.gcp_region

  settings {
    tier = "db-f1-micro"
    ip_configuration {
      authorized_networks {
        value = var.authorized_network
      }
      ipv4_enabled = true
    }
  }
}

resource "google_storage_bucket" "tp6_backups" {
  name     = var.gcs_backup_bucket
  location = var.gcp_region
  storage_class = "STANDARD"
}

output "cloud_run_url" {
  value = google_cloud_run_service.tp6_service.status[0].url
}

output "sql_instance_connection_name" {
  value = google_sql_database_instance.tp6_sql.connection_name
}
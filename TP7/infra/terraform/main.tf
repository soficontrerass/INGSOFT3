terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

provider "google-beta" {
  project = var.project_id
  region  = var.region
}

variable "project_id" {
  type        = string
  description = "GCP Project ID (e.g., 'my-gcp-project')"
}

variable "region" {
  type        = string
  description = "GCP Region (e.g., 'us-central1')"
  default     = "us-central1"
}

variable "environment" {
  type        = string
  description = "Environment: 'qa' or 'prod'"
  validation {
    condition     = contains(["qa", "prod"], var.environment)
    error_message = "Environment must be 'qa' or 'prod'."
  }
}

variable "machine_type" {
  type        = string
  description = "Cloud SQL machine type"
  default     = "db-f1-micro" # db-f1-micro for QA, db-n1-standard-1 for PROD recommended
}

variable "db_version" {
  type        = string
  description = "PostgreSQL version"
  default     = "POSTGRES_15"
}

# ===== ARTIFACT REGISTRY =====
resource "google_artifact_registry_repository" "tp7_repo" {
  location      = var.region
  repository_id = "tp7-repo"
  description   = "Docker repository for TP7 server and client images"
  format        = "DOCKER"

  lifecycle {
    prevent_destroy = true
  }
}

# ===== CLOUD SQL (PostgreSQL) =====
resource "google_sql_database_instance" "tp7_db" {
  name             = "tp7-db-${var.environment}"
  database_version = var.db_version
  region           = var.region

  settings {
    tier      = var.machine_type
    disk_type = "PD_SSD"
    disk_size = 10

    # Public IP for Cloud Run access (TCP Proxy enabled)
    ip_configuration {
      ipv4_enabled = true
      require_ssl  = false
    }

    # Automated backups
    backup_configuration {
      enabled            = true
      start_time         = "03:00"
      transaction_log_retention_days = 7
      backup_retention_settings {
        retained_backups = 7
        retention_unit   = "COUNT"
      }
    }

    # For non-prod, allow automatic storage increase
    database_flags {
      name  = "max_connections"
      value = "100"
    }

    user_labels = {
      environment = var.environment
      app         = "tp7"
    }
  }

  deletion_protection = var.environment == "prod" ? true : false

  depends_on = [google_project_service.sqladmin]
}

resource "google_sql_database" "tp7_app_db" {
  name     = "tp7_${var.environment}_db"
  instance = google_sql_database_instance.tp7_db.name
  charset  = "UTF8"
  collation = "en_US.UTF8"
}

resource "google_sql_user" "tp7_user" {
  name     = "postgres"
  instance = google_sql_database_instance.tp7_db.name
  password = random_password.db_password.result
}

resource "random_password" "db_password" {
  length  = 32
  special = true
}

# ===== SERVICE ACCOUNTS =====
resource "google_service_account" "tp7_sa" {
  account_id   = "tp7-sa-${var.environment}"
  display_name = "TP7 ${upper(var.environment)} Service Account"
}

# IAM Roles for Cloud Run service account
resource "google_project_iam_member" "tp7_cloudsql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.tp7_sa.email}"
}

resource "google_project_iam_member" "tp7_artifact_registry_reader" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.tp7_sa.email}"
}

resource "google_project_iam_member" "tp7_logging" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.tp7_sa.email}"
}

# ===== CLOUD RUN (Server) =====
resource "google_cloud_run_service" "tp7_server" {
  name     = "tp7-server-${var.environment}"
  location = var.region

  template {
    spec {
      service_account_name = google_service_account.tp7_sa.email

      containers {
        # Update image to match your Artifact Registry path
        image = "${var.region}-docker.pkg.dev/${var.project_id}/tp7-repo/tp7-server:latest"

        env {
          name  = "NODE_ENV"
          value = var.environment == "prod" ? "production" : "development"
        }
        env {
          name  = "PORT"
          value = "8080"
        }
        env {
          name  = "DB_USER"
          value = google_sql_user.tp7_user.name
        }
        env {
          name  = "DB_PASS"
          value = google_sql_user.tp7_user.password
        }
        env {
          name  = "DB_HOST"
          value = "/cloudsql/${google_sql_database_instance.tp7_db.connection_name}"
        }
        env {
          name  = "DB_NAME"
          value = google_sql_database.tp7_app_db.name
        }
        # IMPORTANT: Set WEATHERAPI_KEY via GitHub Actions secret
        env {
          name  = "WEATHERAPI_KEY"
          value = "OVERRIDE_IN_ACTIONS"
        }

        ports {
          container_port = 8080
        }

        resources {
          limits = {
            cpu    = "1"
            memory = "512Mi"
          }
        }
      }

      timeout_seconds = 300
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = var.environment == "prod" ? "100" : "10"
        "autoscaling.knative.dev/minScale" = "1"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [
    google_project_service.run,
    google_sql_database_instance.tp7_db
  ]
}

resource "google_cloud_run_service_iam_member" "tp7_server_public" {
  service  = google_cloud_run_service.tp7_server.name
  location = google_cloud_run_service.tp7_server.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ===== CLOUD RUN (Client) =====
resource "google_cloud_run_service" "tp7_client" {
  name     = "tp7-client-${var.environment}"
  location = var.region

  template {
    spec {
      service_account_name = google_service_account.tp7_sa.email

      containers {
        # Client build is pushed from workflow
        image = "${var.region}-docker.pkg.dev/${var.project_id}/tp7-repo/tp7-client:latest"

        ports {
          container_port = 8080
        }

        resources {
          limits = {
            cpu    = "1"
            memory = "256Mi"
          }
        }
      }

      timeout_seconds = 60
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale" = var.environment == "prod" ? "50" : "5"
        "autoscaling.knative.dev/minScale" = "1"
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  depends_on = [google_project_service.run]
}

resource "google_cloud_run_service_iam_member" "tp7_client_public" {
  service  = google_cloud_run_service.tp7_client.name
  location = google_cloud_run_service.tp7_client.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ===== ENABLE APIs =====
resource "google_project_service" "run" {
  service = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "sqladmin" {
  service = "sqladmin.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "artifactregistry" {
  service = "artifactregistry.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "cloudbuild" {
  service = "cloudbuild.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "servicenetworking" {
  service = "servicenetworking.googleapis.com"
  disable_on_destroy = false
}

# ===== OUTPUTS =====
output "project_id" {
  value       = var.project_id
  description = "GCP Project ID"
}

output "region" {
  value       = var.region
  description = "GCP Region"
}

output "artifact_registry_repository" {
  value       = google_artifact_registry_repository.tp7_repo.repository_id
  description = "Artifact Registry repository name"
}

output "database_instance_connection_name" {
  value       = google_sql_database_instance.tp7_db.connection_name
  description = "Cloud SQL connection name (for Cloud Run config)"
}

output "server_url" {
  value       = google_cloud_run_service.tp7_server.status[0].url
  description = "TP7 Server Cloud Run URL"
}

output "client_url" {
  value       = google_cloud_run_service.tp7_client.status[0].url
  description = "TP7 Client Cloud Run URL"
}

output "service_account_email" {
  value       = google_service_account.tp7_sa.email
  description = "Service account email for Cloud Run"
}

output "database_password" {
  value       = google_sql_user.tp7_user.password
  sensitive   = true
  description = "Database password (save securely in GitHub Secrets)"
}
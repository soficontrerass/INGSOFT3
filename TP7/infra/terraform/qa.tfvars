# QA Environment
project_id = "YOUR_GCP_PROJECT_ID"
region     = "us-central1"
environment = "qa"
machine_type = "db-f1-micro"
db_version = "POSTGRES_15"

# For PROD: use plan with -var-file="prod.tfvars"

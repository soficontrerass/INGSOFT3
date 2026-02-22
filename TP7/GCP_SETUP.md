# GCP Cloud Run Deployment Guide - TP7

## Overview

Este documento describe cómo configurar GCP Cloud Run para TP7 (Server + Client + PostgreSQL).

The deployment is automated via GitHub Actions (`deploy-tp7.yml`) with:
- **QA**: Automatic deployment on push to main
- **PROD**: Manual approval deployment

## Prerequisites

1. **GCP Account** with billing enabled
2. **gcloud CLI** installed (`curl https://sdk.cloud.google.com | bash`)
3. **Terraform** (v1.0+) or manual GCP setup
4. **GitHub Actions** with environment secrets configured

---

## Step 1: Create GCP Project

```bash
# Set project ID and region
export PROJECT_ID="tp7-prod"
export REGION="us-central1"

# Create project
gcloud projects create $PROJECT_ID

# Set as active
gcloud config set project $PROJECT_ID

# Enable billing (requires UI: https://console.cloud.google.com/billing)
```

---

## Step 2: Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  sqladmin.googleapis.com \
  artifactregistry.googleapis.com \
  cloudbuild.googleapis.com \
  servicenetworking.googleapis.com \
  iam.googleapis.com
```

---

## Step 3: Create Service Accounts & IAM Roles

### QA Service Account

```bash
# Create QA service account
gcloud iam service-accounts create tp7-sa-qa \
  --display-name="TP7 QA Service Account"

# Grant roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:tp7-sa-qa@${PROJECT_ID}.iam.gserviceaccount.com \
  --role=roles/cloudsql.client

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:tp7-sa-qa@${PROJECT_ID}.iam.gserviceaccount.com \
  --role=roles/run.admin

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:tp7-sa-qa@${PROJECT_ID}.iam.gserviceaccount.com \
  --role=roles/artifactregistry.writer

# Create JSON key for GitHub Actions
gcloud iam service-accounts keys create /tmp/gcp-key-qa.json \
  --iam-account=tp7-sa-qa@${PROJECT_ID}.iam.gserviceaccount.com
```

### PROD Service Account

```bash
gcloud iam service-accounts create tp7-sa-prod \
  --display-name="TP7 PROD Service Account"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:tp7-sa-prod@${PROJECT_ID}.iam.gserviceaccount.com \
  --role=roles/cloudsql.client

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:tp7-sa-prod@${PROJECT_ID}.iam.gserviceaccount.com \
  --role=roles/run.admin

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member=serviceAccount:tp7-sa-prod@${PROJECT_ID}.iam.gserviceaccount.com \
  --role=roles/artifactregistry.writer

gcloud iam service-accounts keys create /tmp/gcp-key-prod.json \
  --iam-account=tp7-sa-prod@${PROJECT_ID}.iam.gserviceaccount.com
```

---

## Step 4: Setup with Terraform (Recommended)

### Edit tfvars files

Update `infra/terraform/qa.tfvars` and `infra/terraform/prod.tfvars`:

```hcl
# qa.tfvars
project_id = "tp7-prod"  # Your GCP project ID
region     = "us-central1"
environment = "qa"
machine_type = "db-f1-micro"
```

### Deploy QA Infrastructure

```bash
cd TP7/infra/terraform

terraform init
terraform workspace new qa || terraform workspace select qa
terraform plan -var-file="qa.tfvars"
terraform apply -var-file="qa.tfvars"

# Capture outputs
terraform output database_instance_connection_name  # Save for GitHub Secrets
terraform output service_account_email
```

### Deploy PROD Infrastructure

```bash
terraform workspace new prod || terraform workspace select prod
terraform plan -var-file="prod.tfvars"
terraform apply -var-file="prod.tfvars"
```

---

## Step 5: Manual Setup (If No Terraform)

### Create Artifact Registry

```bash
gcloud artifacts repositories create tp7-repo \
  --repository-format=docker \
  --location=$REGION
```

### Create Cloud SQL QA

```bash
gcloud sql instances create tp7-db-qa \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=$REGION \
  --no-backup

# Create database and user
gcloud sql databases create tp7_qa_db --instance=tp7-db-qa
gcloud sql users create postgres \
  --instance=tp7-db-qa \
  --password=<RANDOM_SECURE_PASSWORD>

# Get connection name
gcloud sql instances describe tp7-db-qa --format='value(connectionName)'
```

### Create Cloud Run Services (Manual)

This is handled by the GitHub Actions workflow (`deploy-tp7.yml`), which uses `gcloud run deploy` commands.

---

## Step 6: Configure GitHub Actions Secrets

Add these to your GitHub repository **Settings → Secrets and variables → Actions → Repository secrets**:

### QA Environment Secrets (under `qa7` environment)

```
GCP_PROJECT7_ID = "tp7-prod"
GCP_REGION7 = "us-central1"
GCP_SA_KEY7_QA = <content_of_/tmp/gcp-key-qa.json>
INSTANCE_CONN_NAME7_QA = "tp7-prod:us-central1:tp7-db-qa"
DB_NAME7_QA = "tp7_qa_db"
DB_PASS7_QA = <generated_password>
WEATHERAPI_KEY7_QA = "5ef391d6676f48a6834145903262202"
```

### PROD Environment Secrets (under `prod7` environment)

```
GCP_PROJECT7_ID = "tp7-prod"
GCP_REGION7 = "us-central1"
GCP_SA_KEY7_PROD = <content_of_/tmp/gcp-key-prod.json>
INSTANCE_CONN_NAME7_PROD = "tp7-prod:us-central1:tp7-db-prod"
DB_NAME7_PROD = "tp7_prod_db"
DB_PASS7_PROD = <secure_random_password>
WEATHERAPI_KEY7_PROD = "YOUR_PROD_WEATHERAPI_KEY"
```

### Also Create GitHub Environments

1. Go to **Settings → Environments**
2. Create `qa7` environment (QA secrets above)
3. Create `prod7` environment (PROD secrets above)
4. For `prod7`, optionally add required reviewers for manual approval

---

## Step 7: Build & Push Initial Images

The GitHub Actions workflow handles this automatically. But for local testing:

```bash
# Authenticate Docker
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Build and push server
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/tp7-repo/tp7-server:latest TP7/server
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/tp7-repo/tp7-server:latest

# Build and push client (with QA API URL)
docker build \
  --build-arg VITE_API_URL="https://tp7-server-qa-XXXXX.run.app" \
  -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/tp7-repo/tp7-client:latest TP7/client
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/tp7-repo/tp7-client:latest
```

---

## Step 8: Trigger Deployment

### QA Deployment (Automatic)

Push to `main` branch with changes in `TP7/`:

```bash
git commit -m "trigger QA deploy"
git push origin main
```

The `deploy-tp7.yml` workflow will:
1. Build server image
2. Deploy to Cloud Run (tp7-server-qa)
3. Run migrations
4. Deploy client with QA server URL
5. Run smoke tests

### PROD Deployment (Manual)

After QA passes, a `deploy-prod` job awaits manual approval.
Review the job in GitHub Actions and click "Approve" to deploy to production.

---

## Step 9: Access Deployed Services

After successful deployment, retrieve URLs:

```bash
# QA URLs
gcloud run services describe tp7-server-qa --region $REGION --format='value(status.url)'
gcloud run services describe tp7-client-qa --region $REGION --format='value(status.url)'

# PROD URLs
gcloud run services describe tp7-server --region $REGION --format='value(status.url)'
gcloud run services describe tp7-client --region $REGION --format='value(status.url)'
```

---

## Monitoring & Troubleshooting

### View Logs

```bash
# Cloud Run service logs
gcloud run services describe tp7-server-qa --region $REGION \
  | grep logs

# Or use Cloud Logging
gcloud logging read "resource.type=cloud_run_service" \
  --region $REGION \
  --limit=50
```

### Scale Services

```bash
# Update min/max replicas
gcloud run services update tp7-server-qa \
  --min-instances=1 \
  --max-instances=10 \
  --region=$REGION
```

### Database Backups

Cloud SQL backups are automatic (daily for PROD, weekly for QA).

```bash
# View backups
gcloud sql backups list --instance=tp7-db-qa
```

---

## Cost Optimization

- **QA**: Use `db-f1-micro` and min=0 Cloud Run instances (scales down to zero)
- **PROD**: Use `db-n1-standard-1` with min=1 instance for reliability
- Use Cloud CDN for static assets (client)
- Set up budget alerts: https://console.cloud.google.com/billing/budgets

---

## Security Best Practices

1. **Database Passwords**: Store in GitHub Secrets, rotate every 90 days
2. **Service Accounts**: Use minimal IAM roles (least privilege)
3. **Network**: Consider VPC connectors for database access (requires additional setup)
4. **SSL/TLS**: Cloud Run enforces HTTPS by default
5. **API Keys**: Use GCP Secret Manager for WeatherAPI key (update in secrets)

---

## Cleanup

To safely delete infrastructure:

```bash
# Delete Cloud Run services
gcloud run services delete tp7-server-qa --region $REGION
gcloud run services delete tp7-client-qa --region $REGION

# Delete Cloud SQL
gcloud sql instances delete tp7-db-qa

# Destroy with Terraform
terraform destroy -var-file="qa.tfvars"
```

---

## Next Steps

1. Complete GitHub Secrets setup (Step 6)
2. Push code to trigger first QA deployment
3. Verify smoke tests pass
4. Approve PROD deployment
5. Monitor production logs and performance

For questions, see `.github/workflows/deploy-tp7.yml` or Terraform configs in `TP7/infra/terraform/`.

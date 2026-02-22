# GitHub Actions Secrets Template - TP7 Cloud Run Deployment

## How to Use This Template

1. Go to **GitHub Repository → Settings → Secrets and variables → Actions**
2. Create **Environments**: `qa7` and `prod7` (Settings → Environments)
3. Copy each secret below to the correct environment

---

## QA Environment (`qa7`) Secrets

These secrets should be added to the `qa7` environment.

```
GCP_PROJECT7_ID = tp7-prod

GCP_REGION7 = us-central1

GCP_SA_KEY7_QA = {
  "type": "service_account",
  "project_id": "tp7-prod",
  "private_key_id": "XXXXX",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "tp7-sa-qa@tp7-prod.iam.gserviceaccount.com",
  "client_id": "XXXXX",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/tp7-sa-qa%40tp7-prod.iam.gserviceaccount.com"
}

INSTANCE_CONN_NAME7_QA = tp7-prod:us-central1:tp7-db-qa

DB_NAME7_QA = tp7_qa_db

DB_PASS7_QA = [SECURE_RANDOM_PASSWORD_32_CHARS]

WEATHERAPI_KEY7_QA = 5ef391d6676f48a6834145903262202
```

---

## PROD Environment (`prod7`) Secrets

These secrets should be added to the `prod7` environment.

**IMPORTANT**: For `prod7` environment:
- Add **Deployment branches and environments → Add deployment branch**
- Select `main` for production deployments
- Optionally add **Required reviewers** for manual approval

```
GCP_PROJECT7_ID = tp7-prod

GCP_REGION7 = us-central1

GCP_SA_KEY7_PROD = {
  "type": "service_account",
  "project_id": "tp7-prod",
  "private_key_id": "XXXXX",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "tp7-sa-prod@tp7-prod.iam.gserviceaccount.com",
  "client_id": "XXXXX",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/tp7-sa-prod%40tp7-prod.iam.gserviceaccount.com"
}

INSTANCE_CONN_NAME7_PROD = tp7-prod:us-central1:tp7-db-prod

DB_NAME7_PROD = tp7_prod_db

DB_PASS7_PROD = [SECURE_RANDOM_PASSWORD_32_CHARS]

WEATHERAPI_KEY7_PROD = [YOUR_PROD_WEATHERAPI_KEY]
```

---

## How to Obtain Each Secret

### 1. `GCP_PROJECT7_ID`
Your GCP Project ID. Get it from:
```bash
gcloud config get-value project
```

### 2. `GCP_REGION7`
The GCP region where services will run.
```bash
gcloud config get-value compute/region
# Default: us-central1
```

### 3. `GCP_SA_KEY7_QA` and `GCP_SA_KEY7_PROD`
JSON service account key. Create with:
```bash
gcloud iam service-accounts keys create ~/gcp-key-qa.json \
  --iam-account=tp7-sa-qa@${PROJECT_ID}.iam.gserviceaccount.com

# View the file content (copy entire JSON):
cat ~/gcp-key-qa.json
```
**⚠️ Don't commit this file to Git. Delete after copying to GitHub Secrets.**

### 4. `INSTANCE_CONN_NAME7_QA` and `INSTANCE_CONN_NAME7_PROD`
Cloud SQL connection name. Get from Terraform output or:
```bash
gcloud sql instances describe tp7-db-qa --format='value(connectionName)'
# Output: tp7-prod:us-central1:tp7-db-qa
```

### 5. `DB_NAME7_QA` and `DB_NAME7_PROD`
Database name. Default:
- QA: `tp7_qa_db`
- PROD: `tp7_prod_db`

### 6. `DB_PASS7_QA` and `DB_PASS7_PROD`
Secure random password for PostgreSQL. Generate with:
```bash
openssl rand -base64 32
# Example: aB3cD4eFgHiJkLmNoPqRsTuVwXyZ+1/2==
```

Or from Terraform output:
```bash
terraform output database_password
```

### 7. `WEATHERAPI_KEY7_QA` and `WEATHERAPI_KEY7_PROD`
WeatherAPI key from https://www.weatherapi.com/
- QA: Can reuse development key
- PROD: Use separate production key with higher limits

---

## Verification Checklist

- [ ] Created `qa7` environment in GitHub
- [ ] Created `prod7` environment in GitHub
- [ ] Added all QA secrets to `qa7` environment (8 secrets)
- [ ] Added all PROD secrets to `prod7` environment (8 secrets)
- [ ] Verified `GCP_SA_KEY7_QA` and `GCP_SA_KEY7_PROD` are valid JSON
- [ ] Test secret: Run workflow manually via GitHub Actions
- [ ] Monitor first deployment in Cloud Run console

---

## Troubleshooting Secrets

### Workflow fails with "Authenticate to GCP" error
- Check that `GCP_SA_KEY7_QA` is valid JSON (no newlines inside string)
- Verify service account has required IAM roles

### Deploy fails with "Cloud SQL connection error"
- Check `INSTANCE_CONN_NAME7_QA` format: `project:region:instance`
- Verify service account has `cloudsql.client` role

### Client fails to connect to server
- Verify `INSTANCE_CONN_NAME7_*` matches actual Cloud SQL instance name
- Logs: `gcloud logging read "resource.type=cloud_run_service"`

---

For more info, see [GCP_SETUP.md](./GCP_SETUP.md)

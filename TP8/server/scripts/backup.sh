#!/usr/bin/env bash
# Simple placeholder backup script. Requiere gcloud auth/configuration.
set -e
BUCKET="${GCS_BACKUP_BUCKET:-your-tp6-backup-bucket}"
INSTANCE="${INSTANCE_CONN_NAME_PROD:-your-project:region:instance}"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
FILENAME="backup-${TIMESTAMP}.sql.gz"

echo "Exporting DB snapshot to gs://${BUCKET}/${FILENAME} (placeholder)"
# ejemplo usando gcloud (descomentar cuando esté configurado):
# gcloud sql export sql "${INSTANCE}" "gs://${BUCKET}/${FILENAME}" --project="${GCP_PROJECT_ID}"
echo "DONE (placeholder)"
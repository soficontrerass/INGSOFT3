#!/bin/bash

# Backup script for TP6 project

# Variables
BACKUP_BUCKET="gs://tp6-db-backups-ingsoft3-tp6-sof-us-central1"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BACKUP_FILE="backup_$TIMESTAMP.sql"

# Export database to Google Cloud Storage
gcloud sql export sql INSTANCE_NAME $BACKUP_BUCKET/$BACKUP_FILE --database=DATABASE_NAME

# Check if the export was successful
if [ $? -eq 0 ]; then
  echo "Backup successful: $BACKUP_BUCKET/$BACKUP_FILE"
else
  echo "Backup failed"
  exit 1
fi
# TP6 — DevOps CICD Pipelines (2025)

Resumen
- Repo: implementación de pipeline CI/CD con GitHub Actions que despliega backend en Google Cloud Run, base de datos en Cloud SQL (Postgres) y backups en GCS.
- Entornos: QA (deploy automático) y Producción (deploy con aprobación manual).
- Backup: Exportaciones de la BD a gs://tp6-db-backups-ingsoft3-tp6-sof-us-central1 (ya probadas).

URLs
- Cloud Run (prod): (consultar con gcloud)
  - Comando: gcloud run services describe tp6-server --region us-central1 --project ingsoft3-tp6-sof --format='value(status.url)'

Prerequisitos / Secrets (GitHub)
- GCS_BACKUP_BUCKET = tp6-db-backups-ingsoft3-tp6-sof-us-central1
- DB_PASS_PROD
- GCP_SA_KEY_PROD (JSON)
- INSTANCE_CONN_NAME_PROD (ingsoft3-tp6-sof:us-central1:tp6-sql-prod)
- GCP_PROJECT_ID = ingsoft3-tp6-sof
- GCP_REGION = us-central1

Roles / IAM necesarios (en GCP)
- github-actions-prod@...: roles/run.admin, roles/cloudsql.client, roles/storage.objectCreator (ya aplicado)
- Cloud SQL instance service account (p496...@gcp-sa-cloud-sql): roles/storage.objectCreator sobre el bucket (aplicado)
- Cloud SQL service agent: creada y con permisos para backups

Cómo ejecutar el deploy (rápido)
1. Confirmar backup en GCS:
   gsutil ls -l "gs://tp6-db-backups-ingsoft3-tp6-sof-us-central1/"
2. Lanza workflow:
   gh workflow run deploy.yml --repo "OWNER/REPO" --ref main
3. Approve environment `prod` en GitHub Actions si el run queda en espera.
4. Monitor:
   - Logs: GitHub Actions → run → jobs
   - Health: curl "$(gcloud run services describe tp6-server --region us-central1 --project ingsoft3-tp6-sof --format='value(status.url)')/health"
   - Cloud Run logs: gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="tp6-server"' --project=ingsoft3-tp6-sof

Rollback rápido
- Identificar PREV_REVISION:
  gcloud run revisions list --service tp6-server --region us-central1 --project ingsoft3-tp6-sof --format="table(name,traffic)"
- Forzar tráfico a revisión anterior:
  gcloud run services update-traffic tp6-server --region us-central1 --to-revisions PREV_REVISION=100 --project ingsoft3-tp6-sof

Migraciones y backups (qué se hizo)
- Se probó export con gcloud sql export sql y con cloud_sql_proxy+pg_dump.
- Cloud SQL instance SA y Cloud SQL service agent configurados con storage.objectCreator.
- Job de migraciones en Cloud Run (tp6-migrate-prod) previsto en workflow (ver .github/workflows/deploy.yml).

Evidencias que deben entregarse
- Capturas: workflow run exitoso (QA y PROD), approval UI, backup GCS listado, export exitoso.
- comandos/outputs: gcloud sql export, gcloud run describe, gsutil ls -L, logs de migración.

Contacto y notas
- Si necesitás, genero screenshots y un checklist final para la defensa oral.
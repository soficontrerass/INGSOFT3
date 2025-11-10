# decisiones.md — TP5 (resumen de decisiones técnicas)

Resumen ejecutivo
- CI/CD: GitHub Actions (integración nativa con repo, control de approvals y secrets).
- Plataforma: Google Cloud — Cloud Run (backend), Cloud SQL (Postgres), GCS (backups), Cloud Run Jobs (migraciones).
- Motivación: despliegue serverless (Cloud Run) reduce operativa, permite revisiones por revisión (revisions) y control de tráfico (canary/rollback).

Decisiones clave y razones
1. GitHub Actions
   - Razón: fácil integración con repo, Secrets gestionados, environments con aprobaciones manuales.
   - Trade-off: gestión de credenciales (usar SA JSON en secrets).

2. Cloud Run + Cloud SQL
   - Cloud Run: autoscaling, gestión por revisiones, fácil rollback.
   - Cloud SQL: Postgres gestionado, backups y conexión Cloud SQL para producción.
   - Trade-off: Cloud SQL requiere configuración IAM y service agents para export.

3. Backups a GCS
   - Export de BD a bucket GCS para snapshot antes de migraciones.
   - Problema resuelto: permisos — se añadieron roles/storage.objectCreator al Cloud SQL service agent y a la SA de la instancia; también permiso al SA de Actions.

4. Migraciones
   - Ejecutar migraciones con Cloud Run Job (tp5-migrate-prod) apuntando a la instancia prod.
   - Estrategia: crear backup → desplegar nueva revisión con canary 10% → ejecutar migración en Job → smoke-tests → promote 100% o rollback.

5. Aprobaciones y gates
   - Environment `prod` en GitHub con reviewers obligatorios.
   - Humanos revisan logs, backups y smoke-tests antes de aprobar.

6. Rollback
   - Mantener PREV_REVISION en el workflow y usar gcloud run services update-traffic para forzar 100% al anterior.
   - Caso de rollback automático: migración falla → rollback del tráfico y fail del job.

Seguridad / Secrets
- Secrets en GitHub: SA JSON, DB passwords, bucket name.
- Principio: mínimo privilegio en SAs; solo roles necesarios para cada acción (cloudsql.client/admin solo donde hace falta).

Problemas encontrados y soluciones
- 403/412 en gcloud sql export: causado por falta de permisos del Cloud SQL service agent y/o la SA de la instancia. Solución: crear service identity (gcloud alpha services identity create ...) y dar roles/storage.objectCreator al agent y a la SA de la instancia; alternativamente usar cloud_sql_proxy+pg_dump (usado como workaround).
- Edición de IAM bucket desde PowerShell: diferencias de sintaxis entre gsutil y gcloud; preferir gcloud storage o usar gsutil con formato MEMBER:ROLE.

Pruebas realizadas
- Export manual con gcloud sql export (exitoso tras configurar IAM).
- Dump por cloud_sql_proxy + pg_dump (exitoso, usado para testing).
- Backups verificados en GCS y listados.

Checklist de entrega (lo que se presentó)
- Pipeline: .github/workflows/deploy.yml (QA automático, PROD con approval).
- Recursos: Cloud Run service `tp5-server`, Cloud SQL instance `tp5-sql-prod`, GCS bucket `tp5-db-backups-ingsoft3-tp5-sof-us-central1`.
- Evidencias: export exitoso, backups en GCS, logs de cloud_sql_proxy/pg_dump, bindings IAM aplicados.

Preguntas para la defensa (respuestas preparadas)
- ¿Por qué GitHub Actions? integración repo + approvals + secrets.
- ¿Cómo manejás secretos? GitHub Secrets + mínimo privilegio en SAs.
- ¿Criterios para aprobar a prod? backup verificado + QA smoke-tests OK + revisión de logs.
- ¿Rollback? Forzar tráfico a PREV_REVISION y (si aplica) revertir DB mediante backup o scripts de rollback.

Estado actual y pasos pendientes (recomendado)
- Estado: infraestructura creada, IAM ajustado, backups funcionales, workflow configurado.
- Pendientes: añadir capturas (evidencias), completar README con OWNER/REPO y URLs finales, confirmar reviewers en environment `prod`.
- Recomendado para cierre: ejecutar workflow final, tomar capturas y preparar defensa.

// ...existing code...
## Evidencias

Las capturas relevantes están en `TP5/evidencias/`. Ábrelas en el orden indicado durante la defensa.

- Workflow y artifacts (build → deploy):
![Workflow: build → deploy QA → deploy PROD](TP5/evidencias/artifacts.png)

- Workflow esperando aprobación a Producción:
![Workflow esperando aprobación a producción](TP5/evidencias/actions_prod_waiting_approval.png)

- Modal de aprobación en GitHub Actions:
![Modal de aprobación en GitHub Actions](TP5/evidencias/actions_approve_modal.png)

- Servicio en Cloud Run (URL, revisión, tráfico):
![Cloud Run service overview](TP5/evidencias/cloudrun_service.png)

- Health check del servicio (usar la URL en vivo durante la demo):
(Ver `TP5/server/src/routes/api.ts` para el endpoint /health)

- Cloud SQL — instancia y export/backup:
![Cloud SQL instance overview](TP5/evidencias/cloudsql_instance.png)
![Cloud SQL export operation](TP5/evidencias/cloudsql_export_operation.png)

- Backups en GCS y propiedades del objeto:
![Lista de backups en Cloud Storage](TP5/evidencias/gcs_bucket_list.png)
![Propiedades del backup en GCS](TP5/evidencias/gcs_backup_properties.png)

- Variables/Secrets y IAM:
![Variables y secrets por entorno](TP5/evidencias/enviroments_secrets.png)
![Service Accounts y roles IAM](TP5/evidencias/iam_service_accounts.png)

- Migraciones (job) — ejecución y logs:
![Ejecución del job de migración](TP5/evidencias/run_job_migrate.png)

Cómo usarlas en la defensa 
1. Abrir `TP5/evidencias/artifacts.png` (build/artifacts).  
2. Mostrar `TP5/evidencias/cloudrun_service.png` y llamar en vivo al endpoint /health.  
3. Mostrar `TP5/evidencias/actions_prod_waiting_approval.png` y `TP5/evidencias/actions_approve_modal.png`.  
4. Mostrar backups: `TP5/evidencias/gcs_bucket_list.png`, `TP5/evidencias/gcs_backup_properties.png`, y `TP5/evidencias/cloudsql_export_operation.png`.  
5. Mostrar permisos: `TP5/evidencias/iam_service_accounts.png` y `TP5/evidencias/enviroments_secrets.png`.  
6. Finalizar con `TP5/evidencias/run_job_migrate.png` (migraciones).

# decisiones.md — TP6 (resumen de decisiones técnicas)

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
   - Ejecutar migraciones con Cloud Run Job (tp6-migrate-prod) apuntando a la instancia prod.
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
- Recursos: Cloud Run service `tp6-server`, Cloud SQL instance `tp6-sql-prod`, GCS bucket `tp6-db-backups-ingsoft3-tp6-sof-us-central1`.
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
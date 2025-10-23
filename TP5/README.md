# TP5 - DevOps CICD Pipelines

Resumen
- CI/CD con Azure DevOps: Build -> Deploy_QA -> Deploy_PROD (aprobar manualmente).
- QA y PROD en Azure Web Apps (frontend + backend). BD: Azure Database for PostgreSQL.

URLs
- Frontend QA:  https://tp5-frontend-qa-soficontrerass.azurewebsites.net
- Backend QA:   https://tp5-backend-qa-soficontrerass.azurewebsites.net
- Frontend PROD: https://tp5-frontend-prod-soficontrerass.azurewebsites.net
- Backend PROD:  https://tp5-backend-prod-soficontrerass.azurewebsites.net

Validación rápida
- Frontend root:
  curl -I https://tp5-frontend-qa-soficontrerass.azurewebsites.net
- Backend health:
  curl -i https://tp5-backend-qa-soficontrerass.azurewebsites.net/health

Qué contiene este repo
- TP5/frontend — código front (build/ con assets).
- TP5/backend — Node/Express que usa process.env.DB_CONN.
- azure-pipelines.yml — pipeline CI/CD.

Cómo desplegar manualmente (si hace falta)
- Frontend build -> zip contents of build/ and deploy via Azure or az webapp deploy.
- Backend: push a commit; pipeline despliega y ejecuta health-check.

Evidencias
- Añadir en carpeta `TP5/evidence/` capturas: pipeline runs, approval UI, appsettings, logs, y screenshots de las apps.
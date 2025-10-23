# Decisiones técnicas y registro de problemas/soluciones

Arquitectura
- Infra: Azure Web Apps (Linux) para frontend y backend en QA y PROD.
- Base de datos: Azure Database for PostgreSQL (instancia separada, cadenas en App Settings).
- CI/CD: Azure DevOps Pipelines con stages Build, Deploy_QA, Deploy_PROD. Environment `prod` con aprobadores.

Variables por entorno
- QA (ejemplo): DB_CONN, BACKEND_URL, NODE_ENV=development
- PROD (ejemplo): DB_CONN (protegida), BACKEND_URL, NODE_ENV=production
- Health-check script incluido en `TP5/scripts/health-check.sh`.

Aprobaciones
- Deploy_PROD asociado a Environment `prod` en Azure DevOps. Se configuraron aprobadores manuales (UI).

Health checks y rollback
- Post-deploy: script que reintenta GET /health hasta X intentos. Si falla, pipeline marca error.
- Rollback: manual (re-run del último artefacto o revert commit); automatización de rollback no implementada por simplicidad del TP.

Problemas detectados y soluciones aplicadas
1) Frontend 503 al publicar por zip
   - Causa: zip subido contenía la carpeta `build/` en vez de sus contenidos (estructura incorrecta).
   - Solución: zipear los contenidos dentro de build/ (cd build && zip -r ../frontend.zip .) y redeploy.

2) Startup-file npx serve impedía que App Service utilizara archivos estáticos correctamente en ese contexto.
   - Acción: retiré startup-file y desplegué los archivos extraídos en site/wwwroot vía Kudu (PUT /api/zip/site/wwwroot/).

3) Kudu PUT devolvía 401 inicialmente
   - Causa: credenciales de publicación mal usadas en un intento anterior o timing.
   - Acción: obtuve publishing credentials con `az webapp deployment list-publishing-credentials` y volví a ejecutar PUT.

4) Error de script en pipeline (syntax error)
   - Causa: script inline mal cerrado / CRLF vs LF.
   - Solución: reemplacé la tarea Command Line por un script bash robusto con `set -euo pipefail` o por un archivo `TP5/scripts/health-check.sh` en el repo; usé LF.

5) Backend QA devolvía 500 — "DB error"
   - Causa 1: DB_CONN contenía caracteres especiales y una barra invertida `\!` que rompía la cadena.
   - Causa 2: servidor Node escuchaba solo en localhost (probe fallaba).
   - Soluciones:
     - URL-encode de la contraseña en DB_CONN (`@ -> %40`, `! -> %21`) y/o seteo desde Portal sin escapes.
     - Añadí `PGSSLMODE=require` y `ssl: { rejectUnauthorized: false }` en el cliente Postgres para conexión Azure.
     - Cambié `app.listen(PORT)` por `app.listen(PORT, '0.0.0.0', ...)` para que el contenedor sea accesible desde App Service.

Comandos relevantes realizados
- Crear zip del frontend:
  cd TP5/frontend/build && zip -r ../frontend.zip .
- Subir por Kudu:
  curl -X PUT -u "$user:$pwd" --data-binary @../frontend.zip "https://<app>.scm.azurewebsites.net/api/zip/site/wwwroot/"
- Setear DB_CONN (URL-encoded):
  az webapp config appsettings set -g <rg> -n <app> --settings 'DB_CONN=postgres://user:pass%21%40...'
- Añadir health-check script y referenciarlo en azure-pipelines.yml.

Evidencias recomendadas
- `TP5/evidence/`:
  - pipeline_build.png, pipeline_deploy_qa.png, pipeline_approval_prod.png
  - backend_qa_health.txt, backend_prod_health.txt
  - backend_qa_appsettings.json, backend_prod_appsettings.json
  - logs backend/frontend (zip)

Notas finales
- El pipeline está funcional. Falta subir capturas a `TP5/evidence/` y confirmar aprobadores en el Environment `prod` en Azure DevOps.
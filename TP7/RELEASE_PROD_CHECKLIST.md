# TP7 · Release a PROD · Checklist final

## Estado de handoff (2026-02-22)
- Tier 1 + Tier 2: implementado y validado localmente.
- `docker-compose.yml` QA/local corregido:
  - `server` arranca con `node dist/migrate.js && node dist/index.js`.
  - se removieron bind mounts de `client` y `server` para no pisar `dist`.
- CORS habilitado en backend (`app.use(cors())`).
- Runtime local validado:
  - Client: `http://localhost:3000`
  - Server: `http://localhost:8081`
  - `GET /health` y `GET /weatherforecast`: OK
- Ajuste adicional realizado en este cierre:
  - `server/src/migrate.ts` ahora ejecuta **todas** las migraciones `.sql` en orden.
  - `server/migrations/002_searches_favorites_cache.sql` quedó idempotente (`CREATE INDEX IF NOT EXISTS ...`).
  - `GET /api/favorites` validado en local: **200** (antes 500).

## Plan de release QA -> PROD (Cloud Run)
1. Push a `main` con cambios de TP7.
2. Esperar pipeline `deploy-tp7.yml`:
   - `build-server`
   - `deploy-qa` (deploy server QA, migraciones QA, smoke server/client QA)
3. Verificar QA funcional (smoke + navegación crítica).
4. Aprobar manualmente environment `prod7` en GitHub.
5. Ejecutar `deploy-prod`:
   - deploy server PROD
   - migraciones PROD (Cloud Run Job)
   - smoke server/client PROD

## Pre-flight checklist (go/no-go antes de aprobar PROD)
- [ ] `ci7.yml` en verde (server + client tests).
- [ ] `deploy-tp7.yml` job `deploy-qa` en verde.
- [ ] Secretos `prod7` presentes y vigentes:
  - `GCP_SA_KEY7_PROD`
  - `INSTANCE_CONN_NAME7_PROD`
  - `DB_PASS7_PROD`
  - `DB_NAME7_PROD`
  - `WEATHERAPI_KEY7_PROD`
  - `GCP_PROJECT7_ID`
  - `GCP_REGION7`
- [ ] Service account `tp7-sa-prod` con roles requeridos (Cloud Run, Cloud SQL, Artifact Registry, SA user).
- [ ] Confirmar que migración de PROD usa imagen del commit (`${SHA}`) correcto.

## Validación funcional final en PROD (post-deploy)
> Reemplazar `<SERVER_PROD_URL>` y `<CLIENT_PROD_URL>` por las URLs publicadas por Cloud Run.

### Smoke técnico mínimo
- [ ] `GET <SERVER_PROD_URL>/health` -> `200`.
- [ ] `GET <SERVER_PROD_URL>/api/health` -> `200`.
- [ ] `GET <SERVER_PROD_URL>/api/forecasts` -> `200`.
- [ ] `GET <SERVER_PROD_URL>/api/favorites` -> `200`.
- [ ] `GET <CLIENT_PROD_URL>` -> `200` y render de app.

### Flujo funcional mínimo
- [ ] Buscar ciudad en Home.
- [ ] Guardar favorita (POST `/api/favorites`) sin error.
- [ ] Ver favorita en pantalla de favoritos.
- [ ] Eliminar favorita (DELETE `/api/favorites/:city`) y confirmar actualización UI.
- [ ] Verificar ausencia de `HTTP 500` en UI y consola.

## Rollback operativo (si falla PROD)
1. No aprobar `prod7` si falla QA.
2. Si falla tras aprobar:
   - Re-deploy de imagen previa estable en `tp7-server` y `tp7-client` (tag SHA anterior).
   - Revalidar smoke (`/health`, `/api/favorites`, home client).
3. Registrar incidente en evidencias con:
   - URL afectada
   - hora
   - commit SHA
   - error exacto
   - acción de recuperación

## Evidencia mínima a adjuntar
- Captura de jobs verdes (`deploy-qa` + `deploy-prod`).
- Captura de approval `prod7`.
- Respuestas HTTP (200) de smoke endpoints.
- Captura de flujo “agregar/eliminar favorito” en PROD.

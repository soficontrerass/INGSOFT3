# Decisiones técnicas y problemas detectados en TP7

## Resumen de problemas encontrados (con causa y solución aplicada / recomendada)

1. Mocks de la BD que no se aplicaban antes de cargar los módulos
   - Síntoma: tests devolvían 200 en vez de 500; fallos intermitentes.
   - Causa: los módulos se importaban (require/ESM) antes de hacer jest.doMock / jest.mock.
   - Solución aplicada: usar jest.resetModules() + jest.clearAllMocks() y aislar con jest.isolateModulesAsync + jest.doMock antes del require en tests. Recomendado: siempre mockear dependencias antes de cargar el módulo bajo prueba.

2. Tests de migrate con errores al mockear fs/readFileSync
   - Síntoma: "Migration failed Error: boom" y "Migration failed Error: nofile" en migrate.branches.cover.test.ts.
   - Causa: mocks de fs aplicados incorrectamente o lectura de archivos lanzando errores no controlados.
   - Solución aplicada: aislar módulos en los tests de migrate y mockear explícitamente 'fs' y '../db' según cada caso. Controlar process.exitCode en el test y limpiar after.

3. Endpoint /api/health que no fallaba en tests
   - Síntoma: test esperaba 500 cuando la query de BD fallaba, pero ruta devolvía 200.
   - Causa: la ruta hacía la comprobación de BD sólo si existían ciertas env vars (DB_NAME/DATABASE_URL) y los tests no las pusieron.
   - Soluciones posibles:
     - Ajustar tests para establecer process.env.DATABASE_URL antes de require (recomendado).
     - O bien cambiar la ruta para siempre ejecutar query('SELECT 1') (menos recomendado en entornos sin BD).
   - Decisión: preferir cambiar tests para simular entorno con BD y mantener comportamiento de producción.

4. Uso de Math.random() marcado como Security Hotspot
   - Síntoma: SonarCloud alerta sobre generación no criptográficamente segura.
   - Causa: Math.random() señalado por Sonar como no seguro para datos sensibles.
   - Soluciones:
     - Si es sólo datos de ejemplo, marcar hotspot como "Reviewed" en SonarCloud.
     - Si se quiere eliminar aviso, reemplazar por crypto.randomInt para valores aleatorios no sensibles.
   - Decisión: se ofreció parche para usar crypto.randomInt; aceptar depende de si se desea eliminar la advertencia.

5. Construcción de URLs con datos de la request (req.get('host') / req.protocol)
   - Síntoma: SonarCloud marca posible SSRF / uso de datos controlados por el usuario.
   - Causa: llamar internamente a `fetch(`${host}/api/forecasts`)` usando req.get('host').
   - Soluciones:
     - Evitar construir URL desde request: usar INTERNAL_HOST/PORT env vars o URL fija.
     - Mejor: importar y reutilizar la función/servicio que obtiene forecasts en vez de llamar por HTTP.
   - Decisión: recomendar refactor para llamar al servicio interno; parche mínimo para usar INTERNAL_HOST/PORT si es necesario.

6. SonarCloud Quality Gate fallando (security_rating y hotspots)
   - Síntoma: Quality Gate = ERROR; condiciones que fallan: new_security_rating, new_security_hotspots_reviewed.
   - Causa: vulnerabilidades detectadas y 0% de hotspots revisados.
   - Acciones necesarias:
     - Revisar y corregir vulnerabilidades reales (parchar código, sanitizar, actualizar dependencias).
     - Revisar/manualmente marcar Security Hotspots en SonarCloud (o corregir el código según corresponda).
   - Decisión: priorizar fixes de seguridad y revisión de hotspots en SonarCloud; luego re-ejecutar análisis.

7. Tests y orden de ejecución / contaminación global
   - Síntoma: tests que pasan en local pero fallan en CI o viceversa; logs ruidosos (server listening).
   - Causa: estado global (process.env, módulos cargados, puerto ocupado) entre tests.
   - Soluciones:
     - Ejecutar tests en --runInBand en CI (ya usado).
     - Resetear módulos entre tests y limpiar variables de entorno (set/clear en cada isolateModulesAsync).
     - Evitar levantar servidores reales en tests: mockear o usar servers efímeros.

8. Peticiones internas por HTTP en lugar de reutilizar lógica
   - Síntoma: complejidad y avisos de seguridad (SSRF) por fetch interno.
   - Consecuencia: sobrecoste, dependencias de red dentro del mismo proceso y más puntos de fallo.
   - Solución recomendada: extraer lógica en servicios (src/services) y reutilizar funciones directamente desde app.ts.

## Recomendaciones generales derivadas
- En tests, siempre mockear dependencias externas (BD, fs, fetch) antes de cargar el módulo.
- Usar jest.isolateModulesAsync y limpiar process.env y mocks en beforeEach/afterEach.
- Revisar y marcar Security Hotspots en SonarCloud cuando sean aceptables; arreglar vulnerabilidades reales.
- Reemplazar Math.random por crypto.randomInt si se desea eliminar advertencias.
- Evitar construir URLs desde datos del request; usar configuración interna o invocar servicios directamente.
- Mantener CI reaccionando a Quality Gate, pero balancear entre falsos positivos y correcciones reales.

---

## 9. Deploy QA/PROD en GCP Cloud Run (Strategy & Implementation)

### Arquitectura General

**Objetivo**: Automatizar deploy de TP7 (server + client) a dos ambientes (QA automático, PROD manual) en GCP Cloud Run, con validaciones automáticas (smoke tests).

**Componentes involucrados**:
- **GCP Cloud Run**: Servicio managed para server y client.
- **GCP Cloud SQL**: PostgreSQL 15 (QA y PROD).
- **GCP Artifact Registry**: Repo privado de imágenes Docker (`tp7-repo`).
- **Service Accounts**: `tp7-sa-qa` y `tp7-sa-prod` con roles específicos.
- **GitHub Actions**: Workflow `deploy-tp7.yml` que orquesta build, deploy, migraciones, smoke tests.
- **GitHub Secrets**: Credenciales y config por ambiente (`qa7`, `prod7`).

### Workflow: `.github/workflows/deploy-tp7.yml`

#### **Job 1: build-server**
- **Environment**: qa7 (usa GCP_SA_KEY7_QA)
- Pasos:
  1. Checkout código.
  2. Auth a GCP.
  3. Enable APIs.
  4. Build Docker image (TP7/server) → push a Artifact Registry.

#### **Job 2: deploy-qa**
- **Depends on**: build-server
- **Environment**: qa7
- Pasos:
  1. Deploy server a Cloud Run (`tp7-server-qa`) con Cloud SQL connection.
  2. Run migrations (Cloud Run Job `tp7-migrate-qa`): ejecuta `node dist/migrate.js` para CREATE TABLE.
  3. **Smoke test server**: `curl --fail --retry 5 $URL/health` → valida 200 + DB OK.
  4. Build client image con `VITE_API_URL=<server-qa-url>`.
  5. Deploy client a Cloud Run (`tp7-client-qa`).
  6. **Smoke test client**: `curl --fail --retry 5 $URL` → valida 200 + HTML.

#### **Job 3: deploy-prod**
- **Depends on**: deploy-qa
- **Environment**: prod7 (manual approval en GitHub)
- Pasos: Idénticos a deploy-qa, pero con secrets PROD, SAs PROD, nombres sin "-qa".

### Setup de Infraestructura GCP

1. **APIs**: `gcloud services enable run.googleapis.com sqladmin.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com`
2. **Artifact Registry**: `gcloud artifacts repositories create tp7-repo --location=us-central1 --repository-format=docker`
3. **Cloud SQL QA/PROD**: Instancias PostgreSQL 15, db-f1-micro, with databases `tp7_qa` / `tp7_prod`.
4. **Service Accounts**: `tp7-sa-qa`, `tp7-sa-prod` con roles: `run.admin`, `cloudsql.client`, `artifactregistry.writer`, `iam.serviceAccountUser`, `logging.viewer`.
5. **GitHub Secrets**: Repository + Environment (qa7/prod7) secrets con credenciales, DB names, connection strings.

### Smoke Tests ✅

**Server Health (QA y PROD)**:
```bash
curl --fail --retry 5 --retry-delay 3 "$URL/health"
```
Valida que Cloud Run levantó el container y DB respondió 200.

**Client Health (QA y PROD)**:
```bash
curl --fail --retry 5 --retry-delay 3 "$URL"
```
Valida que cliente estático (dist) está sirviendo y responde 200.

**Status**: ✅ Ambos jobs completaron smoke tests exitosamente.

---

Registro de acciones realizadas (resumen)
- Tests actualizados para aislar módulos y mockear db antes del require.
- Propuesta/patch para reemplazar Math.random por crypto.randomInt.
- Propuesta/patch para eliminar req.get('host') y usar INTERNAL_HOST/PORT.
- GCP infrastructure configurada (Cloud Run, Cloud SQL, Artifact Registry, Service Accounts) via Terraform.
- GitHub workflow `deploy-tp7.yml` con 3 jobs (build-server, deploy-qa, deploy-prod) con cierre de circuito.
- Smoke tests en QA y PROD validando server health + client load.
- Documentación completa: `GCP_SETUP.md` + `GITHUB_SECRETS_TEMPLATE.md` + Terraform (main.tf, qa.tfvars, prod.tfvars).
- Multi-ambiente local: docker-compose.yml (DEV), docker-compose.prod.yml (PROD), .env.qa / .env.prod templates.

---

## 10. Terraform Infrastructure as Code (Cloud Run + Cloud SQL + Artifact Registry)

### Características principales

**Terraform (`infra/terraform/main.tf`):**
- Cloud Run services para server y client (QA y PROD con diferentes configs)
- Cloud SQL PostgreSQL 15 con backup automático
- Artifact Registry Docker repo
- Service Accounts + IAM roles granulares
- Outputs para GitHub Secrets (connection strings, URLs, passwords)

**Variables y Environments (`qa.tfvars`, `prod.tfvars`):**
- QA: `db-f1-micro`, max 10 replicas, min 0 (scale to zero)
- PROD: `db-n1-standard-1`, max 100 replicas, min 1, deletion protection ON

**Deployment Workflow (`deploy-tp7.yml`):**
1. **build-server**: Build Docker image, push a Artifact Registry
2. **deploy-qa**: Deploy QA (automático), migrations, smoke tests
3. **deploy-prod**: Deploy PROD (manual approval), idéntico a QA

### Setup Quickstart

1. **Crear GCP project** e implementar instrucciones en `GCP_SETUP.md` (Steps 1-6)
2. **Configurar GitHub Secrets** usando template en `GITHUB_SECRETS_TEMPLATE.md`
3. **Desplegar con Terraform**:
   ```bash
   cd TP7/infra/terraform
   terraform init
   terraform workspace new qa
   terraform apply -var-file="qa.tfvars"
   ```
4. **Trigger deploy via GitHub**: Push a main, workflow se ejecuta automáticamente
5. **Monitorear**: Ver logs en Cloud Run console, URL de servicios en terraform output

### Security & Best Practices

- **Secrets Management**: Todos los passwords en GitHub Secrets (no en código)
- **IAM Roles**: Least privilege (service accounts solo con roles necesarios)
- **HTTPS**: Cloud Run enforces HTTPS, cert automático
- **Backups**: Cloud SQL backup automático diario
- **Deletion Protection**: PROD tiene deletion_protection = true

---

Fin del documento.
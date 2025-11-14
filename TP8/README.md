# TP7 - Server — Documentación técnica

Resumen
- Proyecto: TP7 (server)
- Documentación breve sobre decisiones, cobertura, pruebas de integración y pipeline.
- Evidencias en ./evidencias (capturas de SonarCloud, cobertura y artifacts).

## 1) Justificación tecnológica
Stack elegido:
- Node.js + TypeScript: ejecución rápida, tipado estático para reducir errores y buena integración con Jest/Sonar.
- Express: micro-framework ligero para endpoints REST.
- Jest + Supertest: pruebas unitarias e integración HTTP.
- SonarCloud: análisis estático y Quality Gate para mantener calidad y seguridad.
- Postgres (simulado en tests): base de datos relacional habitual en entornos académicos/producción.

Motivos:
- Familiaridad y productividad con TypeScript y Node.
- Ecosistema con herramientas maduras para testing y CI.
- SonarCloud permite mantener políticas de calidad automatizadas.

## 2) Análisis de cobertura — inicial vs final
- Cobertura inicial (antes de ajustes): ≈ 81% (ver evidencia `coverage.png`, `servercoverage.png`).
- Cobertura final (después de correcciones): 94.87% statements, 75.34% branches, 87.5% funcs, 95.65% lines (ver tabla generada por jest en el reporte, evidencia `servercoverage.png`).
- Notas: se trabajó en tests que mockean DB y en aislar módulos para mejorar coverage y fiabilidad de tests.

## 3) Capturas de reportes (evidencias)
- Quality Gate / Sonar: `qualitygate.png`
  ![qualitygate](./evidencias/qualitygate.png)
- Issues / Seguridad: `issues.png`
  ![issues](./evidencias/issues.png)
- Coverage report (global): `coverage.png`
  ![coverage](./evidencias/coverage.png)
- Coverage servidor: `servercoverage.png`
  ![servercoverage](./evidencias/servercoverage.png)
- Duplications: `duplications.png`
  ![duplications](./evidencias/duplications.png)
- Artifacts generados en CI: `artifacts.png`
  ![artifacts](./evidencias/artifacts.png)
- End-to-end report resumen: `e2eresumen.png` y `e2e.png`
  ![e2e resumen](./evidencias/e2eresumen.png)
  ![e2e](./evidencias/e2e.png)
- Client coverage: `clientcoverage.png`
  ![clientcoverage](./evidencias/clientcoverage.png)

## 4) Casos de prueba de integración implementados
- Endpoint /api/forecasts
  - Respuesta cuando DB devuelve rows (mock success) → 200 y array mapeado.
  - Error en consulta DB (mock reject) → 500 con { error: 'database error' }.
- Endpoint /api/health
  - DB ok → 200 { status: 'ok' }.
  - DB fallo → 500 { status: 'error', error: <msg> }.
- Endpoint /weatherforecast
  - Reutiliza /api/forecasts: respuesta mapeada con campos date, temperatureC, summary.
- Estrategia de tests:
  - Unitarios: funciones en services mockeadas.
  - Integración: Supertest con jest.isolateModulesAsync + jest.doMock para controlar mocks de db antes del require y evitar contaminación entre tests.

## 5) Documentación de la configuración del pipeline
- CI (GitHub Actions / similar) ejecuta:
  1. npm ci
  2. npm run lint (opcional)
  3. npm run test:ci (jest con coverage, --runInBand)
  4. sonar-scanner con variables: SONAR_TOKEN, SONAR_ORG, SONAR_PROJECT_KEY
  5. Generación de artifacts y reportes (adjuntos en evidencia)
- Quality Gate:
  - Rechazo del pipeline si SonarCloud devuelve status ERROR.
  - Condiciones críticas observadas: security_rating y security_hotspots_reviewed (0% revisados) — se debe revisar o arreglar los hotspots en SonarCloud.
- Variables importantes en CI:
  - NODE_ENV=ci
  - PORT (si se usa en tests que lancen servidor)
  - INTERNAL_HOST/INTERNAL_PORT (recomendado para llamadas internas en app)
  - SONAR_TOKEN (secreto)

## 6) Reflexión personal (breve)
- Herramientas como Jest y SonarCloud automatizan la detección temprana de errores y problemas de seguridad.
- Tests aislados (mocks aplicados antes de require) mejoran reproducibilidad y evitan flakiness.
- SonarCloud aporta gobernanza sobre vulnerabilidades y hotspots; marcar hotspots revisados o corregir código elimina falsos positivos y evita bloqueos en CI.
- Recomendación: priorizar fixes de seguridad y reviews de hotspots; usar RNG seguro si datos influyen en seguridad; evitar construir URLs desde datos del cliente.

---

Archivos relevantes:
- Tests: `src/tests/*.ts`
- Servicios: `src/services/forecasts.ts`
- Rutas: `src/routes/api.ts`
- Evidencias: `./evidencias/*` (adjuntas en el repo)

Fin del documento.
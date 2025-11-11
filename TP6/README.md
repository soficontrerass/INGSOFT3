# TP6 — Pruebas Unitarias

Contenido
- server/  (backend TypeScript + Jest)
- client/  (frontend React + Vitest)

Prerequisitos
- Node.js 18+ o 20
- npm

Comandos útiles

Server
- Instalar dependencias:
  cd TP6/server
  npm ci
- Test (desarrollo):
  npm run test
- Test + coverage (CI):
  npm run test:ci
- Levantar server (dev):
  $env:PORT=8080; npm run dev   (Windows PowerShell)
  PORT=8080 npm run dev         (Linux/macOS)

Client
- Instalar dependencias:
  cd TP6/client
  npm ci
- Test (watch):
  npm run test
- Test + coverage:
  npm run test:ci
- Levantar app (dev):
  npm run dev

Configuración de entornos para tests
- Cliente: crear `.env.test` en `TP6/client` con:
  VITE_API_URL=http://localhost:8080

Estrategia de pruebas
- Backend: tests unitarios con Jest/ts-jest; mockeo de la capa de datos.
- Frontend: Vitest + Testing Library; MSW recomendado para pruebas de integración.

CI/CD
- Archivo: .github/workflows/ci-tests.yml
- Ejecuta tests en servidor y cliente y sube artifacts `backend-coverage` y `frontend-coverage`.

Evidencias
- Guardar capturas en `/docs/evidencias` y referenciarlas en `decisiones.md`.

Soporte
- Si necesitás ejemplos de tests adicionales (servicios backend, componentes frontend, MSW), indicá cuál prefieres y los genero.
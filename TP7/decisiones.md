# Decisiones de testing — TP6

Resumen ejecutivo
- Backend: Jest + ts-jest (TypeScript). Tests de rutas y servicios; mockeo de la capa de BD con jest.mock.
- Frontend: Vitest + @testing-library/react. Tests de componentes y flujos fetch; uso de vi.stubGlobal('fetch') en unit tests (MSW recomendado para integración).
- Objetivo alcanzado: cobertura de tests en backend y frontend (100% en backend; 100% en client según reporte local).

Estrategia de mocking
- Backend: mockeo del módulo src/db (export query) con jest.mock(...) en cada suite. Tests controlan respuestas/respuestas rechazadas para cubrir success / error / edge cases.
- Frontend: stub global de fetch con vi.stubGlobal en tests unitarios (cubre loading / success / HTTP error / network error). Para pruebas de integración usar MSW (no implementado aquí pero recomendado).

Casos de prueba clave implementados
- Backend:
  - GET /api/health: sin DB configurada (ok), con DB configurada (SELECT 1) y caso de error (500).
  - GET /api/forecasts: retorno con { rows }, retorno con array directo, retorno undefined, y caso DB error (500).
  - Servicio getForecasts: success + DB rejection (throws).
- Frontend (App.tsx):
  - flujo loading → fetch ok → render lista (ej.: Sunny 20°C).
  - respuesta HTTP no-ok (HTTP 500) → muestra error.
  - fetch rechazado → muestra error.

Comandos para reproducir localmente (PowerShell, Windows)
- Backend
  cd C:\INGSOFT3\ingsoft3\TP6\server
  npm ci
  npm run test         # desarrollo
  npm run test:ci      # con coverage (CI)

- Frontend
  cd C:\INGSOFT3\ingsoft3\TP6\client
  npm ci
  npm run test         # vitest watch
  npm run test:ci      # run + coverage

Evidencias
- Cobertura frontend:
  ![Coverage Frontend](evidencias/coveragefrontend.png)
- Cobertura backend:
  ![Coverage Backend](evidencias/coveragebackend.png)
  
Decisiones técnicas y justificación (breve)
- Jest/ts-jest: integración estable con TypeScript, fácil mocking y cobertura.
- Vitest + Testing Library: velocidad y API compatible con Vite/React, pruebas orientadas a usuario.
- Mocking: aislar I/O (DB y fetch) en unit tests acelera ejecución y evita dependencias externas.
- CI: ejecutar npm run test:ci en server y client; subir artifacts coverage (ya configurado en workflow).

Notas para la entrega y defensa
- Explicar por cada test qué se arregla: qué se mockea, qué se valida y por qué (Arrange / Act / Assert).
- Mostrar las capturas en /TP6/evidencias y el HTML de coverage si es necesario (coverage/lcov-report/index.html).
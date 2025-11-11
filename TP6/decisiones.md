# Decisiones de testing — TP06

Resumen
- Backend: Jest + ts-jest para TypeScript. Tests unitarios para rutas/servicios, mocks de la capa DB.
- Frontend: Vitest + @testing-library/react + happy-dom. Tests unitarios de componentes y hooks; MSW/vi.stubGlobal para mocks de red.
- CI: GitHub Actions ejecuta tests y sube artefactos de coverage.

Frameworks y justificación
- Jest + ts-jest: soporte TS, integración sencilla, generación de coverage.
- Vitest: rápida integración con Vite/React y API similar a Jest.
- @testing-library/react: pruebas centradas en el usuario.
- MSW (recomendado): mocks de red realistas para tests de integración sin backend.

Estrategia de mocking
- Backend: mockear el módulo de acceso a BD (pg) en los tests unitarios (jest.mock o sinon).
- Frontend:
  - Unit tests: vi.stubGlobal('fetch') o mocks locales por test.
  - Integración: usar MSW para simular endpoints /api/forecasts, /api/health.
- Evitar llamadas de red reales en unit tests; sólo integración end-to-end debe usar backend levantado.

Casos de prueba clave (ejemplos)
- Backend:
  - Servicio de forecasts: respuesta con datos, respuesta vacía, error de BD -> lanzado/capturado.
  - Rutas: /api/forecasts responde 200 con array; /api/health responde ok.
- Frontend:
  - Componente principal (App): renderiza, muestra loader, muestra lista tras fetch.
  - Formulario: validaciones y errores visibles.
  - Manejo de errores de red: mostrar mensaje cuando fetch falla.

CI / Evidencias
- GitHub Actions ejecuta `npm run test:ci` en server y client y sube carpetas `coverage` como artifacts.
- Incluir capturas de pantalla en `/docs/evidencias/` y referencias en este archivo.

Cómo reproducir localmente (resumen)
- Server:
  - cd TP6/server
  - npm ci
  - npm run test        # unit tests
  - npm run test:ci     # coverage
- Client:
  - cd TP6/client
  - npm ci
  - npm run test        # vitest interactive
  - npm run test:ci     # vitest --run --coverage

Evidencias
- Agregar screenshots de GitHub Actions (artifacts `backend-coverage` y `frontend-coverage`) en `/docs/evidencias` y referencias aquí.

Notas finales
- Objetivo: cubrir lógica de negocio y rutas críticas en backend; componentes y flujos UX en frontend. Priorizar casos de error y edge cases.
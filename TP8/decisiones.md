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
Registro de acciones realizadas (resumen)
- Tests actualizados para aislar módulos y mockear db antes del require.
- Propuesta/patch para reemplazar Math.random por crypto.randomInt.
- Propuesta/patch para eliminar req.get('host') y usar INTERNAL_HOST/PORT o llamar al servicio interno.
- Documentación y evidencias en `./evidencias` para auditoría.

Fin.
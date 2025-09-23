# Decisiones del TP3

## Metodología ágil elegida: Kanban

Elegí **Kanban** porque es la más simple para equipos pequeños y trabajos prácticos. Permite visualizar el flujo de trabajo, priorizar tareas y adaptarse rápidamente a cambios sin la necesidad de planificar sprints estrictos.

### Justificación

- Fácil de implementar en GitHub Projects.
- No requiere roles ni ceremonias complejas.
- Permite agregar y mover tareas según avance real.
- Ideal para trabajos prácticos y equipos reducidos.

## Estructura de trabajo

- **Epic:** Issue principal que representa una funcionalidad completa.
- **User Stories:** Issues que describen funcionalidades específicas.
- **Tasks:** Issues para dividir el trabajo en acciones concretas.
- **Bugs:** Issues para reportar y solucionar errores.

Toda la gestión se realiza en GitHub Projects, simulando el tablero de Azure Boards.

## Evidencia de funcionamiento

Se adjuntan capturas en `/evidencias` mostrando el tablero, Pull Requests y ejecución de pipelines.

---

## Metodología ágil elegida: Agile (Azure DevOps)

Elegí la metodología **Agile** en Azure DevOps porque permite organizar el trabajo en Epics, User Stories, Tasks y Bugs, facilitando la visualización y seguimiento del avance. Es flexible y adecuada para equipos pequeños, y se integra fácilmente con la gestión de sprints.

No configuré el equipo principal y las áreas del proyecto para centralizar la colaboración y asignación de tareas ya que voy a trabajar sola.

---
## Estructura de trabajo en Azure Boards

- **Epic:** Implementar sistema de login.
- **User Stories:** 
  - Iniciar sesión
  - Recuperar contraseña
  - Registrarme
- **Tasks:** 
  - Diseñar el formulario de registro
  - Implementar la validación de datos de registro
  - Diseñar formulario login
  - Implementar la autenticación de usuario
  - Diseñar formulario recuperación contraseña
  - Implementar el envío de email de recuperación
- **Bugs:** 
  - El formulario de login no valida el email correctamente
  - El sistema permite registrar usuarios con contraseñas demasiado cortas

Todos los work items están asignados al Sprint 1 (2 semanas) y relacionados según corresponda.  
Se adjuntan capturas de pantalla en `/evidencias` mostrando la organización y el avance.

---

## Integración técnica y automatización

La gestión de trabajo se realizó en Azure DevOps, mientras que el control de versiones y la automatización de CI/CD se implementaron en GitHub usando GitHub Actions.  
Esto permite aprovechar lo mejor de ambas plataformas: organización ágil y automatización moderna.

- Se configuraron ramas de feature y Pull Requests protegidos por políticas de revisión.
- Se implementó un workflow de GitHub Actions para validar los builds y asegurar la calidad antes de cada merge.
- Todo el código y la evidencia están versionados y documentados en el repositorio.

---

## Integración CI/CD

Se configuró GitHub Actions para ejecutar el código automáticamente en cada cambio relevante.  
Esto asegura que el sistema funciona y permite detectar errores rápidamente antes de integrar nuevas funcionalidades.

## Evidencia de funcionamiento

Se adjuntan capturas en `/evidencias` mostrando:
- Board con work items organizados en Azure DevOps.
- Pull Requests aprobados y mergeados en GitHub.
- Ejecución exitosa del pipeline de GitHub Actions.

---
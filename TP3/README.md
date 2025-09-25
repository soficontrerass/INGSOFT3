# TP3 - Introducción a Azure DevOps (usando GitHub Actions)

## Acceso y clonación

1. Clona el repositorio:
   ```
   git clone https://github.com/soficontrerass/INGSOFT3.git
   ```
2. Ingresa a la carpeta del TP3:
   ```
   cd INGSOFT3/TP3
   ```

## Estructura del proyecto

- `/src`: Código fuente de la aplicación de ejemplo.
- `/evidencias`: Capturas de pantalla y evidencia de funcionamiento.
- `/decisiones.md`: Justificación de metodología y estructura.
- `/.github/workflows`: Configuración de GitHub Actions (CI/CD).

## Ejecución de pipelines

Los pipelines se ejecutan automáticamente al hacer push o Pull Request sobre las ramas principales y de feature.  
Puedes ver el estado en la pestaña "Actions" del repositorio.

## Gestión de trabajo

- **Azure DevOps:** Usado para la gestión de Epics, User Stories, Tasks, Bugs y Sprints.
- **GitHub:** Usado para control de versiones, Pull Requests y automatización con GitHub Actions.

## Contribución

1. Crea una rama de feature:
   ```
   git checkout -b feature/nombre
   ```
2. Realiza tus cambios y haz commit.
3. Crea un Pull Request y solicita revisión.

## Evidencia

Las capturas de pantalla de la gestión en Azure Boards, los Pull Requests y la ejecución de pipelines están en `/evidencias`.

---
## Integración continua (CI) con GitHub Actions

El archivo `.github/workflows/ci.yml` configura un pipeline que ejecuta automáticamente el archivo `TP3/src/app.js` en cada push y Pull Request a la rama principal.  
Puedes ver el historial y estado de las ejecuciones en la pestaña "Actions" del repositorio.

## Evidencia

Las capturas de pantalla de la gestión en Azure Boards, los Pull Requests y la ejecución de pipelines están en `/evidencias`.

---
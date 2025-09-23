# TP3 - DevOps, Azure Boards y GitHub Actions

## Proyecto de Ingeniería de Software III - UCC

Este repositorio contiene la configuración y evidencias del trabajo práctico TP3, integrando Azure DevOps para gestión ágil y GitHub para control de versiones y automatización de builds.

---

## 1. Acceder al proyecto de Azure DevOps

- Ingresa a [Azure DevOps - TP3_INGSOFT3](https://dev.azure.com/jczuksofia/TP3) 
- Accede con tu cuenta institucional o la cuenta invitada por el equipo.
- Navega por los Boards para ver Epics, User Stories, Tasks y Bugs, y por Sprints para ver la planificación.

---

## 2. Clonar y trabajar con el repositorio

```bash
git clone https://github.com/soficontrerass/INGSOFT3.git
cd INGSOFT3/TP3
```

- Crea una rama de feature para tus cambios:
  ```bash
  git checkout -b feature/nombre-de-tu-feature
  ```
- Realiza tus cambios y haz commit:
  ```bash
  git add .
  git commit -m "Descripción de tu cambio"
  git push origin feature/nombre-de-tu-feature
  ```
- Solicita un Pull Request en GitHub para fusionar tu rama con `main`.

---

## 3. Ejecutar los pipelines

- El pipeline está configurado en GitHub Actions bajo la carpeta `.github/workflows/ci.yml`.
- Cada push a la rama `main` o a ramas de feature dispara automáticamente el workflow que ejecuta `TP3/src/app.js`.
- Puedes ver el historial y estado de las ejecuciones en la pestaña "Actions" del repositorio.

---

## 4. Estructura del proyecto

- **Azure Boards:**  
  - Epics: Agrupan funcionalidades principales.
  - User Stories: Requisitos funcionales del usuario.
  - Tasks: Actividades técnicas asociadas a cada User Story.
  - Bugs: Registro y seguimiento de errores.

- **GitHub:**  
  - Código fuente y archivos de configuración en `TP3/src/`.
  - Ramas principales: `main`, `feature/login`, `feature/register`, `feature/recover-password`.
  - Pull Requests: Solicitudes de integración de cambios desde ramas de feature a `main`.
  - GitHub Actions: Automatización de builds y CI/CD.

---

## Evidencia

Las capturas de pantalla de la gestión en Azure Boards, los Pull Requests y la ejecución de pipelines están en `/evidencias`.

---

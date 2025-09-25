# TP4 - CI/CD con GitHub Actions

Este proyecto implementa un pipeline CI/CD en GitHub Actions para una aplicación con frontend (React) y backend (Node.js).

## Estructura

- `front/`: React frontend
- `back/`: Node.js Express backend
- `decionses.md` : Decisiones técnicas y evidencias
- `README.md` : Documentación de ejecución

## Prerequisitos

- Node.js 18.x o superior
- NPM
- Cuenta en GitHub

## Cómo ejecutar localmente

### Frontend
```bash
cd frontend
npm install
npm start
```

El frontend estará disponible en http://localhost:3000

### Backend
```bash
cd backend
npm install
npm start
```

## CI/CD

El pipeline se ejecuta automáticamente en cada push o pull request a `main` o `master` que afecte archivos en `TP4/`.

- **build-front**:
  - Instala dependencias
  - Compila React
  - Publica artefacto `front-dist`
- **build-back**:
  - Instala dependencias
  - Ejecuta tests
  - Publica artefacto `back-dist`

## Puertos

- Frontend: 3000 (por defecto)
- Backend: 3001

## Artefactos Generados

- **front-dist**: Build optimizado de React
- **back-dist**: Código backend listo para deploy

## Problemas y Soluciones

- **Rutas en el pipeline**: Inicialmente los jobs fallaban porque las rutas configuradas no coincidían con los nombres reales de las carpetas (`front` vs `frontend`, `back` vs `backend`). Se corrigió el workflow para usar las rutas correctas.
- **node_modules en verde**: Aparecían como archivos nuevos porque no estaban ignorados. Se solucionó agregando `.gitignore` en ambas carpetas.
- **Carpetas faltantes en el repo**: El pipeline fallaba si las carpetas no estaban subidas a GitHub. Se aseguraron los commits y el push de toda la estructura.

---


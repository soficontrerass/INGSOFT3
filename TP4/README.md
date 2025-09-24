# TP4 - CI/CD con GitHub Actions

## Estructura

- `front/`: React frontend
- `back/`: Node.js Express backend

## Prerequisitos

- Node.js >= 18
- npm

## Cómo ejecutar localmente

### Frontend
```bash
cd front
npm install
npm start
```

### Backend
```bash
cd back
npm install
npm start
```

## CI/CD

El pipeline se ejecuta automáticamente en cada push/pull request a `main` usando GitHub Actions.  
Compila el frontend y ejecuta los tests del backend. Los artefactos se publican en cada ejecución.

## Puertos

- Frontend: 3000 (por defecto)
- Backend: 3001

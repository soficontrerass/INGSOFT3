# Decisiones TP4

## Stack elegido

- Frontend: React
- Backend: Node.js + Express

## Estructura del repo

- `TP4/front`: código frontend
- `TP4/back`: código backend
- `.github/workflows/ci.yml`: workflow CI/CD

## Diseño del pipeline

- Dos jobs: build-front y build-back
- build-front: instala dependencias y compila React
- build-back: instala dependencias y ejecuta tests
- Publica artefactos de ambos

## Evidencias

- Capturas de ejecución del pipeline y artefactos publicados (agregar imágenes aquí)


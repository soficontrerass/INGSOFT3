# INGSOFT3

Este repositorio contiene los trabajos prácticos de la materia Ingeniería de Software III.

## Estructura

- **TP1/**: git basico
- **TP2/**: docker 
- **README.md**: Este archivo principal

## Introducción

Cada carpeta contiene el código, documentación y recursos correspondientes a cada TP.  
TP1 y TP2 fueron desarrollados originalmente en repositorios separados.

## Unificación de repositorios

Al principio habia hecho un repositorio por TP, asi que unificamos ambos TPs en este repositorio.  
El proceso incluyó:

- Clonar el repositorio de TP1 como base.
- Importar el historial y archivos de TP2 usando `git merge --allow-unrelated-histories`.
- Organizar los archivos de cada TP en sus respectivas carpetas (`TP1` y `TP2`).
- Eliminar archivos duplicados de la raíz para mantener la estructura limpia.
- Realizar commit y push para reflejar los cambios en GitHub.

De esta forma, se conserva el historial de commits de ambos trabajos y se facilita la revisión y entrega.

---

## Problemas encontrados y soluciones

- Al principio, trabajé en varias ramas principales (`main` y `master`), lo que generó confusión y dificultó la integración de los TPs.
- Tuve archivos sin seguimiento que bloqueaban el cambio de rama y el pull, por lo que debí moverlos o eliminarlos temporalmente.
- La protección de ramas en GitHub impedía hacer el merge del PR sin revisión, así que documenté el proceso y solicité revisión.
- Finalmente, decidí dejar `main` como rama principal y eliminé `master` para evitar confusiones futuras.

## Decisiones tomadas

- Usar `main` como rama principal para todos los TPs.
- Documentar cada integración y problema en este archivo para asegurar trazabilidad y calidad.

---

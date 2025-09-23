# Decisiones del TP Docker

---

## Elección de la aplicación y tecnología

Elegí Node.js con Express porque es fácil de configurar, ampliamente usada y permite crear APIs REST rápidamente.  
La base de datos seleccionada es PostgreSQL por su robustez, soporte de volúmenes y buena integración con Node.js.

---

## Elección de imagen base

Usé la imagen oficial `node:20` porque es la última versión LTS, segura y optimizada para producción.

---

## Elección de base de datos

PostgreSQL fue elegida por su estabilidad, soporte de persistencia y facilidad de uso con Docker.

---

## Estructura y justificación del Dockerfile

- `FROM node:20`: Usa la imagen base de Node.js.
- `WORKDIR /app`: Define el directorio de trabajo.
- `COPY package*.json ./`: Copia los archivos de dependencias.
- `RUN npm install`: Instala las dependencias.
- `COPY . .`: Copia el resto del código.
- `EXPOSE 3000`: Expone el puerto de la app.
- `CMD ["npm", "start"]`: Comando para iniciar la app.

---

## Configuración de QA y PROD (variables de entorno)

Utilicé variables de entorno en `docker-compose.yml` para diferenciar los entornos QA y PROD, cambiando el valor de `NODE_ENV` y las credenciales de la base de datos.

---

## Estrategia de persistencia de datos (volúmenes)

Configuré el volumen `db_data` en Docker Compose para asegurar que los datos de PostgreSQL persistan aunque los contenedores se reinicien o eliminen.

---

## Estrategia de versionado y publicación

Construí y publiqué dos versiones de la imagen en Docker Hub:
- `dev`: Para desarrollo y pruebas.
- `v1.0`: Versión estable para producción.

---

## Evidencia de funcionamiento

- La aplicación responde correctamente en ambos entornos (`/ping` y `/mensajes`).
- La base de datos mantiene los datos entre reinicios de contenedor.
- Los logs muestran la conexión exitosa y la persistencia de datos.

---

## Problemas y soluciones

- **Problema:** La app intentaba conectarse a la base antes de que estuviera lista.
  **Solución:** Usé `depends_on` en Docker Compose y agregué un pequeño retraso en la app.
- **Problema:** Error de conexión por variables de entorno mal configuradas.
  **Solución:** Revisé los nombres y valores en `docker-compose.yml`.

---

## Mejoras y justificaciones

- Separé las bases de datos para QA y PROD para simular entornos reales y evitar interferencia de datos.
- Agregué un frontend para facilitar la interacción y visualización de los datos.
- Usé un script SQL para inicializar la base de datos automáticamente.
- Documenté cada decisión y problema resuelto para facilitar la defensa oral.



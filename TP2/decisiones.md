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

### Problema: La app intentaba conectarse a la base antes de que estuviera lista

**Descripción:**  
Al iniciar los servicios con Docker Compose, la aplicación backend intentaba conectarse a la base de datos antes de que el contenedor de la base estuviera completamente inicializado, lo que generaba errores de conexión.

**Solución:**  
Utilicé la opción `depends_on` en el archivo `docker-compose.yml` para asegurar que el contenedor de la base de datos se iniciara antes que la aplicación. Además, agregué un pequeño retraso en la lógica de conexión de la app para esperar unos segundos antes de intentar conectarse.

**Aprendizaje:**  
Es fundamental controlar el orden de inicio de los servicios en Docker Compose y considerar posibles demoras en la inicialización de la base de datos para evitar errores de conexión.


### Problema: Error de conexión por variables de entorno mal configuradas

**Descripción:**  
La aplicación no lograba conectarse a la base de datos debido a errores en los valores de las variables de entorno (por ejemplo, nombres de host, usuario, contraseña o nombre de la base de datos incorrectos).

**Solución:**  
Revisé y corregí los nombres y valores de las variables de entorno en el archivo `docker-compose.yml`, asegurando que coincidieran con la configuración real de los contenedores y la base de datos.

**Aprendizaje:**  
La correcta configuración de las variables de entorno es clave para el funcionamiento de aplicaciones containerizadas. Es importante verificar y documentar estos valores para evitar errores de conexión y facilitar el mantenimiento.

### Problema: El frontend en Docker no iniciaba por falta de dependencias

**Descripción:**  
Al intentar levantar el frontend en Docker, el contenedor fallaba con el error `react-scripts: not found`. El servicio se detenía inmediatamente después de intentar iniciar.

**Causa:**  
El problema se debía a que la carpeta `node_modules` local se estaba incluyendo en el contexto de construcción de Docker, lo que impedía que `npm install` se ejecutara correctamente dentro del contenedor. Además, Docker usaba la caché y no reinstalaba las dependencias necesarias.

**Solución:**  
- Eliminé la carpeta `node_modules` localmente en `/frontend`.
- Agregué un archivo `.dockerignore` en `/frontend` con el siguiente contenido:
  ```
  node_modules
  build
  ```
- Reconstruí el contenedor del frontend usando el comando:
  ```
  docker-compose build --no-cache frontend
  docker-compose up frontend
  ```
Esto permitió que Docker instalara todas las dependencias correctamente y el frontend funcionara.

**Aprendizaje:**  
Es importante excluir `node_modules` del contexto de Docker usando `.dockerignore` y reconstruir sin caché si hay problemas con dependencias. Así se evita que el contenedor falle por falta de paquetes.

### Problema: Error "Failed to fetch" en el frontend

**Descripción:**  
Al intentar agregar mensajes desde el frontend, aparecía el error `Failed to fetch`. El backend respondía correctamente a las peticiones GET y POST desde el navegador y PowerShell, pero el frontend no lograba conectarse.

**Causa:**  
La URL utilizada en el fetch del frontend era `host.docker.internal`, pero en mi entorno (Windows con Docker Desktop), el frontend y el backend estaban expuestos en la misma máquina y red, por lo que debía usarse `localhost`.

**Solución:**  
Modifiqué el código del frontend para que las peticiones fetch usaran `localhost` en vez de `host.docker.internal`:
```javascript
fetch(`http://localhost:${env === 'qa' ? '3001' : '3002'}/mensajes`)
```
Con este cambio, el frontend pudo conectarse correctamente al backend y el error desapareció.

**Aprendizaje:**  
La URL para acceder a los servicios depende de cómo y dónde se ejecutan los contenedores. Es importante probar ambas opciones (`localhost` y `host.docker.internal`) según el entorno y la configuración de red de Docker.

---


## Mejoras y justificaciones

- Separé las bases de datos para QA y PROD para simular entornos reales y evitar interferencia de datos.
- Agregué un frontend para facilitar la interacción y visualización de los datos.
- Usé un script SQL para inicializar la base de datos automáticamente.
- Documenté cada decisión y problema resuelto para facilitar la defensa oral.



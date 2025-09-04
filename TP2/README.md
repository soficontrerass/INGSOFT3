# mi-api-docker

## Descripción

API REST simple en Node.js con Express y base de datos PostgreSQL, preparada para ejecutarse en entornos QA y PROD usando Docker y Docker Compose.

---

## Requisitos

- Docker
- Docker Compose

---

## Construcción de las imágenes

```bash
docker-compose build
```

---

## Ejecución de los contenedores

```bash
docker-compose up
```

---

## Acceso a la aplicación

- **QA:** [http://localhost:3001/ping](http://localhost:3001/ping)
- **PROD:** [http://localhost:3002/ping](http://localhost:3002/ping)

Para ver los mensajes almacenados en la base de datos:
- **QA:** [http://localhost:3001/mensajes](http://localhost:3001/mensajes)
- **PROD:** [http://localhost:3002/mensajes](http://localhost:3002/mensajes)

---

## Conexión a la base de datos PostgreSQL

```bash
docker exec -it mi-api-docker-db-1 psql -U postgres
```

Dentro de la consola de PostgreSQL, puedes crear la tabla y agregar datos:

```sql
CREATE TABLE tabla_a (mensaje VARCHAR(50));
INSERT INTO tabla_a VALUES ('Hola mundo!');
SELECT * FROM tabla_a;
```

---

## Verificación de persistencia de datos

1. Reinicia los contenedores:
   ```bash
   docker-compose down
   docker-compose up
   ```
2. Vuelve a consultar `/mensajes` y verifica que los datos siguen presentes.

---

## Acceso a los logs

Para ver los logs de la aplicación:
```bash
docker-compose logs app-qa
docker-compose logs app-prod
```

---

## Versiones de la imagen en Docker Hub

- Desarrollo: `sofiacontreras2003/2025_tp02_repobase:dev `
- Estable: `sofiacontreras2003/2025_tp02_repobase:v1.0`

---

## Problemas frecuentes

- Si la app no conecta a la base, espera unos segundos y vuelve a intentar.
- Si necesitas limpiar la base, elimina el volumen con:
  ```bash
  docker volume rm mi-api-docker_db_data
  ```

---

## Evidencia de funcionamiento

Incluye capturas de pantalla o logs mostrando:
- La app corriendo en QA y PROD.
![alt text](image.png)
- Conexión exitosa a la base de datos.

- Persistencia de datos entre reinicios.

---

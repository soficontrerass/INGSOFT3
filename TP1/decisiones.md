# decisiones.md

## 1. Flujo de trabajo utilizado y justificación

Utilicé un flujo de trabajo basado en ramas para separar cada tarea importante:
- Rama `main` para la versión estable del proyecto.
- Rama `feature/saludo-personalizado` para el desarrollo de nuevas funcionalidades.
- Rama `hotfix/arreglo-error` para correcciones.

Este enfoque permite trabajar de forma ordenada, evitando que los cambios en desarrollo afecten la versión estable. 

---

## 2. Comandos utilizados y motivos

- `git clone <url>`  
  Para obtener el repositorio base en mi máquina local.

- `git config user.name "Sofi Contreras"`  
  `git config user.email "2215803@ucc.edu.ar"`  
  Para configurar mi identidad y que los commits queden correctamente registrados.

- `git checkout -b feature/saludo-personalizado`  
  Para crear una rama de desarrollo separada y trabajar en la nueva funcionalidad sin afectar `main`.

- `git add src/app.js`  
  Para preparar los cambios realizados en el archivo antes de hacer el commit.

- `git commit -m "<mensaje>"`  
  Para registrar los cambios en el historial.

- `git checkout main`  
  Para volver a la rama principal y simular el error en producción.

- `git checkout -b hotfix/arreglo-error`  
  Para crear una rama específica para corregir el error en producción.

- `git merge hotfix/arreglo-error`  
  Para integrar el fix a la rama principal (`main`).

- `git cherry-pick <hash_del_fix>`  
  Consulté a la IA para aprender este comando y lo usé para aplicar solo el commit del fix en la rama de desarrollo, sin traer otros cambios.

- `git remote set-url origin <url_de_mi_fork>`  
  Para asegurar que los cambios se subieran a mi propio repositorio y no al original.

- `git push origin <rama>`  
  Para subir cada rama al repositorio remoto en GitHub.

- `git tag -a v1.0 -m "Versión estable 1.0"`  
  Para marcar la versión estable del proyecto siguiendo la convención semántica.

- `git push origin v1.0`  
  Para subir el tag de la versión estable al remoto.

- `git log --oneline --graph --all`  
  Para revisar el historial de commits y verificar la integración de los cambios.

- `git status`  
  Para comprobar el estado del repositorio y asegurarme de que no quedaran cambios sin registrar.

---

## 3. Integración del fix

Para corregir el error simulado en producción:
- Creé la rama `hotfix/arreglo-error` desde `main` y realicé el commit del fix.
- Integré el fix a `main` usando `git merge`, asegurando que la corrección estuviera en la rama principal.
- Consulté a la IA para aprender a usar `git cherry-pick`, ya que no conocía el comando. Usé `git cherry-pick <hash_del_fix>` en la rama de desarrollo para aplicar solo el commit del fix, sin traer otros cambios.

Verifiqué el resultado revisando el historial de commits y probando el funcionamiento del código.

---

## 4. Problemas encontrados y soluciones

- **Desconocimiento de cherry-pick:** No sabía cómo aplicar un fix específico en otra rama sin traer todos los cambios, así que consulté a la IA y probé el comando en mi entorno.
- **Remoto incorrecto:** Al principio trabajé con el remoto del repositorio original. Para solucionarlo, hice el fork y cambié el remoto con `git remote set-url origin <url_de_mi_fork>`, asegurando que todos los cambios se subieran a mi propio repositorio.

---

## 5. Calidad y trazabilidad en trabajo en equipo

Para asegurar calidad y trazabilidad en un equipo real:
- Cada integrante debe trabajar en ramas separadas para cada tarea o funcionalidad.
- Los commits deben ser atómicos y tener mensajes claros y descriptivos.
- Todas las decisiones y problemas deben documentarse en un archivo compartido como este.
- Los Pull Requests deben usarse para revisión y discusión antes de integrar cambios a la rama principal.
- Las versiones estables deben marcarse con tags siguiendo una convención clara (por ejemplo, `v1.0`).

Este proceso permite identificar fácilmente quién hizo cada cambio, por qué se hizo, y facilita la corrección de errores y la integración de nuevas funcionalidades de forma segura.

---

## 6. Uso de IA

Declaré y documenté cada vez que consulté a la IA, especialmente para comandos desconocidos y buenas prácticas. Verifiqué cada sugerencia en mi entorno antes de aplicarla definitivamente.
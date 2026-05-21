# Desplegue - SmartMark


### C5 - Control de versiones + integración y despliegue continuo

Durante el desarrollo de SmartMark, se utilizó Git para el control de versiones. Se implementó el despliegue continuo utilizando GitHub Actions, lo que permite desplegar nuevas versiones a Docker Hub cada vez que se hacen commits en la rama `main`. Esto asegura que las imágenes de Docker estén siempre actualizadas con la última versión estable del código.

No se usó ramas, ya que fue un proyecto desarrollado por una sola persona y el despliegue continuo no estaba implementado hasta tener una version estable del proyecto, por lo que se trabajó directamente en la rama `main`.

Actualmente, con el Despliegue Continuo implementado en caso de que se fuera a desarrollar nuevas funcionalidades o solucionar cualquier error se realizaria desde una nueva rama
`feature/nueva-funcionalidad` o `fix/solucion-error` y una vez se realizara el merge a `main` se desplegaría automáticamente la nueva versión a Docker Hub.

En cuanto a la Integración Continua se intentó implementar la documentación automática del código del backend, en un HTML y este se publicara automáticamente en GitHub Pages y en la rama `gh-pages` cada vez que se hiciera un commit en la rama `main`, pero no fui capaz de hacerlo funcionar correctamente y debido al tiempo y el resto de cosas por implementar decidí pasar al despliegue continuo y el resto de la documentación para volver a intentar esto en caso de que tuviera tiempo.

#### Comandos basicos de Git

```bash
git branch //Lista todas tus ramas locales 

git branch -a //Lista todas tus ramas locales y remotas

git checkout -b feature/nueva-funcionalidad //Crea y cambia a una nueva rama

git add . //Agrega todos los cambios al staging area

git commit -m "Descripción de los cambios" //Crea un commit con los cambios

git push origin feature/nueva-funcionalidad //Sube la rama al repositorio remoto

git checkout main //Cambia a la rama main

git merge feature/nueva-funcionalidad //Fusiona la rama de la nueva funcionalidad
```

![Workflow](https://i.gyazo.com/cc4957ba0bb764a6575cfa9c409079a7.png)

Como se puede apreciar en la imagen el workflow funciona correctamente y cada vez que se hace un commit en la rama `main` se despliega automáticamente la nueva versión a Docker Hub, lo que permite que los usuarios puedan acceder a las últimas funcionalidades rápidamente.

```yml
   - name: Build and push Backend // Nombre del paso
     uses: docker/build-push-action@v4 // Acción de GitHub para construir y subir imágenes de Docker
     with:
       context: ./backend // Contexto de construcción (carpeta del backend)
       file: ./backend/Dockerfile // Ruta al Dockerfile del backend
       push: true // Indica que se debe subir la imagen al registro
       tags: | 
         ${{ secrets.DOCKER_USERNAME }}/smartmark-backend:latest // Etiqueta "latest" para la última versión
         ${{ secrets.DOCKER_USERNAME }}/smartmark-backend:${{ github.sha }} // Etiqueta con el hash del commit para versiones específicas
```
Este es un fragmento del archivo de workflow de GitHub Actions que se encarga de construir y subir la imagen del backend a Docker Hub cada vez que se hace un commit en la rama `main`, este es bastante parecido al paso que usa el frontend solo que cambiando el context y el file por los del directorio frontend. Se utiliza el contexto de construcción para especificar la carpeta del backend y el Dockerfile correspondiente, y se etiquetan las imágenes con "latest" y con el hash del commit para facilitar la identificación de versiones específicas.

Se usan los secrets de GitHub para almacenar de forma segura el nombre de usuario y el token de Docker Hub, lo que permite que el workflow pueda autenticarse correctamente al subir las imágenes. Esto asegura que solo personas autorizadas puedan realizar despliegues a Docker Hub, manteniendo la seguridad del proceso de despliegue continuo.

### C1 - Buen diseño de arquitectura de la aplicación

La aplicacion se encuentra dividida en dos partes principales: el backend y el frontend, cada uno con su propia estructura de carpetas y responsabilidades claramente definidas. El backend se encarga de manejar la lógica de negocio, la gestión de la base de datos y la exposición de una API REST para que el frontend pueda interactuar con los datos. El frontend, por otro lado, se encarga de la interfaz de usuario, la experiencia del usuario y la comunicación con el backend a través de llamadas a la API.

Para ver el diagrama de la arquitectura de la aplicación, puedes avanzar hasta el siguiente apartado del README.md: [Diagrama de Arquitectura](#estructura-del-proyecto)

````yaml
services:
  # Servicio Backend
  backend:
    image: adriandiaz24/smartmark-backend:latest
    container_name: smartmark-backend
    ports:
      - "3000:3000"

    frontend:
    image: adriandiaz24/smartmark-frontend:latest
    container_name: smartmark-frontend
    ports:
       - "3001:3001"
````

Como se puede apreciar en el fragmento del archivo `docker-compose.yml`, la aplicación se encuentra dividida en dos servicios principales: `backend` y `frontend`. Cada servicio utiliza una imagen de Docker específica que se ha construido y subido a Docker Hub, lo que permite una fácil gestión y despliegue de cada componente de la aplicación.

Para revisar el codigo completo puedes abrir el archivo [docker-compose.yml](https://github.com/AdrianDiaz24/SmartMark/blob/main/docker-compose.yml)

A continuación se muestra la evidencias del correcto funcionamiento de la aplicación utilizando Docker Compose:

Con el comando `docker-compose up -d` se inician ambos servicios y se puede acceder a la aplicación a través de `http://localhost:3001` para el frontend y `http://localhost:3000/api` para la API del backend.

![Docker Compose](https://i.gyazo.com/171069b425e26e9b3e78105934fa9631.png)

En la imagen se puede ver que ambos contenedores están corriendo desde Docker Desktop

![Docker Desktop](https://i.gyazo.com/69f5977c66c231b40e4fbc9fbee2cac5.png)

En la imagen se puede ver la aplicación en ejecución, mostrando la interfaz de usuario del frontend y confirmando que el backend está funcionando correctamente al mostrar los datos de los marcadores.

![Aplicación en ejecución](https://i.gyazo.com/86f5ae2b568d81f55580a03c7f13d18f.png)

### C2 - Buena implementación en Docker
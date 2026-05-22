# Desplegue - SmartMark

## 1. Entorno de Despliegue Utilizado

SmartMark ha sido concebida y desarrollada bajo la idea **Self-Hosted**. Esto significa que, a diferencia de una aplicación SaaS tradicional desplegada en plataformas de nube pública (como AWS, Vercel o Railway), la aplicación se distribuye como un paquete de software estructurado para que el usuario final lo instale en su propia infraestructura (ordenador local, servidor NAS o un VPS privado).

Por tanto, el "entorno de despliegue" y distribución principal del proyecto es **Docker Hub**. Las imágenes compiladas y optimizadas de la aplicación residen de forma pública en esta aplicación web, listas para ser descargadas y ejecutadas en cualquier entorno compatible con el motor de Docker.

---

## 2. Configuración de CI/CD

El ciclo de vida del desarrollo cuenta con una automatización enfocada en la **Despliegue Continuo (CD - Continuous Deployment)** implementada mediante **GitHub Actions**.

El flujo de trabajo automatizado (*Workflow*) está configurado de la siguiente manera:

1. **Triggers de ejecución:** Se activa automáticamente con cada `git push` a las ramas `main` o `master`. Además, incluye el evento `workflow_dispatch` para permitir la ejecución manual del despliegue desde la interfaz de GitHub si fuera necesario.


2. **Fase de Build:** Los servidores de integración de GitHub (entornos Ubuntu) clonan el repositorio, configuran el entorno con Docker Buildx, acceden a los directorios `./frontend` y `./backend`, y construyen las imágenes de contenedor de forma independiente.


3. **Autenticación y Push:** El *workflow* inicia sesión en Docker Hub utilizando credenciales seguras (almacenadas de forma encriptada en los *secrets* del repositorio como `DOCKER_USERNAME` y `DOCKER_PASSWORD`(Token)) y sube las imágenes compiladas.


4. **Estrategia de Tagging:** Cada imagen se etiqueta de forma dual:
    * Con la etiqueta `latest` para facilitar instalaciones rápidas.
    * Con el identificador único del commit (`github.sha`) para permitir la trazabilidad exacta del código y garantizar la capacidad de reversión (*rollback*) a versiones específicas.

A continuación, se adjunta el código exacto del *pipeline* que gestiona este despliegue automatizado:

```yaml
name: Build and Push Docker Images

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

jobs:
  build-and-push:
    runs-on: ubuntu-latest

    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2

      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      # Build y push del Backend
      - name: Build and push Backend
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          file: ./backend/Dockerfile
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/smartmark-backend:latest
            ${{ secrets.DOCKER_USERNAME }}/smartmark-backend:${{ github.sha }}

      # Build y push del Frontend
      - name: Build and push Frontend
        uses: docker/build-push-action@v4
        with:
          context: ./frontend
          file: ./frontend/Dockerfile
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/smartmark-frontend:latest
            ${{ secrets.DOCKER_USERNAME }}/smartmark-frontend:${{ github.sha }}

      - name: Deployment notification
        run: |
          echo "Docker images built and pushed successfully!"
          echo "Backend image: ${{ secrets.DOCKER_USERNAME }}/smartmark-backend:latest"
          echo "Frontend image: ${{ secrets.DOCKER_USERNAME }}/smartmark-frontend:latest"
```
---

## 3. Proceso de Despliegue Documentado

La instalación en producción para el usuario final se ha simplificado al máximo gracias a la orquestación con **Docker Compose**, delegando la complejidad técnica al archivo de configuración. El proceso de despliegue consta únicamente de tres comandos:

1. **Obtención del archivo:** El usuario descarga el archivo `docker-compose.yml` preconfigurado desde el repositorio público.


2. **Descarga de las imagenes:** Mediante el comando `docker-compose pull`, el sistema descarga automáticamente las imágenes más recientes del frontend y backend desde Docker Hub.


3. **Construcción y ejecución:** Al ejecutar `docker-compose up -d`, el motor levanta los contenedores en segundo plano, mapea los puertos correspondientes (3000 y 3001), establece la red interna para la comunicación segura entre la API y la interfaz, y monta los volúmenes necesarios para asegurar la persistencia de los datos de la base de datos SQLite.

A continuación se detallan los pasos para el despliegue local tanto clonando el proyecto como utilizando el Docker-Compose, así como la opción alternativa para usuarios que prefieran ejecutar los contenedores de forma individual.

### Clonar el proyecto
```bash
mkdir "smartmark"
cd "smartmark"
git clone https://github.com/AdrianDiaz24/SmartMark.git
```

### Iniciar el Backend
```bash
cd backend
npm run start
```

Output esperado:
```
Servidor de SmartMark corriendo en http://localhost:3000
Conexión a la base de datos SQLite establecida correctamente.
Base de datos inicializada correctamente
========== VERIFICADOR DE URLs ==========
(Información de la última verificación o mensaje de primera verificación)
```

### Iniciar el Frontend
En una nueva terminal:
```bash
cd frontend
npm start
```

Abrirá automáticamente `http://localhost:3001` en tu navegador.

### Acceder a la Aplicación
- **URL:** `http://localhost:3001`
- **API Backend:** `http://localhost:3000/api`

---

## Despliegue con Docker

### Requisitos Previos

- **Docker** ([descargar](https://docs.docker.com/get-docker/))

Verificar instalación:
```bash
docker --version
```

### Opción 1: Docker Compose (RECOMENDADO)

La forma más fácil y rápida. **No necesitas clonar el repositorio:**

#### 1. Descargar solo el archivo `docker-compose.yml`

```bash
# Crear una carpeta para el proyecto
mkdir smartmark
cd smartmark

# Descargar el archivo docker-compose.yml
curl -o docker-compose.yml https://raw.githubusercontent.com/AdrianDiaz24/SmartMark/main/docker-compose.yml
```

#### 2. Descargar las imágenes más recientes
```bash
docker-compose pull
```

#### 3. Crear los contenedore e iniciar la aplicación
```bash
docker-compose up -d
```

#### 4. Acceder a la aplicación

- **Frontend:** http://localhost:3001
- **Backend API:** http://localhost:3000/api

**Ver logs en tiempo real:**
```bash
docker-compose logs -f
```

**Detener la aplicación:**
```bash
docker-compose stop
```

**Reiniciar la aplicación:**
```bash
docker-compose restart
```

**Eliminar contenedores (sin eliminar volúmenes):**
```bash
docker-compose down
```

**Eliminar contenedores y volúmenes (Borra la BD):**
```bash
docker-compose down -v
```

### Opción 2: Descargar Imágenes Individuales desde Docker Hub

Si prefieres ejecutar los contenedores sin Docker Compose:

#### Red Interna
```bash
docker network create smartmark-network
```

#### Backend
- **Repositorio:** [adriandiaz24/smartmark-backend](https://hub.docker.com/r/adriandiaz24/smartmark-backend)

```bash
docker run -d -p 3000:3000 --name smartmark-backend --network smartmark-network adriandiaz24/smartmark-backend:latest
```

#### Frontend
- **Repositorio:** [adriandiaz24/smartmark-frontend](https://hub.docker.com/r/adriandiaz24/smartmark-frontend)

```bash
docker run -d -p 3001:3001 --name smartmark-frontend --network smartmark-network adriandiaz24/smartmark-frontend:latest
```

### Cómo Funcionan las Imágenes

- **Backend:** `adriandiaz24/smartmark-backend:latest` - Servidor API de marcadores con SQLite
- **Frontend:** `adriandiaz24/smartmark-frontend:latest` - Aplicación React compilada y servida
- **Automático:** Las imágenes se actualizan automáticamente en Docker Hub cuando hay commits en la rama `main`

### Solución de Problemas con Docker

**Puerto en uso:**
```bash
# Ver contenedores en ejecución
docker ps

# Detener un contenedor
docker stop CONTAINER_ID
```

**Eliminar contenedores y volúmenes:**
```bash
docker-compose down -v
```

**Ver logs de un contenedor:**
```bash
docker logs CONTAINER_ID -f
```

**Forzar descarga de últimas imágenes:**
```bash
docker-compose pull --no-parallel
docker-compose up -d
```


---

## 4. URL de la Aplicación en Producción

Dada su naturaleza *self-hosted*, SmartMark **no posee una única URL de producción global** o un dominio comercial asociado. La URL de acceso en producción dependerá exclusivamente del entorno físico o virtual donde el usuario decida desplegar los contenedores.

Aunque la URL puede variar incluso en el despliegue local dependiendo de la configuración de usuario, esta URL sería la "Default" o "Predefinida", a su vez se dejara las URL de tanto las imagenes en "Docker Hub" como el repositorio de GitHub para facilitar el acceso a los usuarios:

- **URL SmartMark Predefinida:** `http://localhost:3001`
- **URL Imagen Frontend:** `https://hub.docker.com/repository/docker/adriandiaz24/smartmark-frontend`
- **URL Imagen Backend:** `https://hub.docker.com/repository/docker/adriandiaz24/smartmark-backend`
- **URL Docker-Compose.yml:** `https://github.com/AdrianDiaz24/SmartMark/blob/main/docker-compose.yml`

Con esto y las instrucciones de despliegue documentadas en el apartado anterior, cualquier usuario con conocimientos básicos de Docker podrá desplegar la aplicación en su entorno local o en un servidor privado sin mayores complicaciones, accediendo a la URL predefinida para interactuar con la interfaz de usuario y gestionar sus marcadores de forma eficiente.

---

## 5. Recuperación Despliegue

En este apartado se encuentra documentandos los criterios de evaluacion del modulo de Despliegue de Aplicacione Web, se podra encontrar en el orden de la rubrica entregada por Edu, encontrandose en el siguiente orden:

1. [C6 - Documentación-del-proyecto](#c6---documentación-del-proyecto)
2. [C5 - Control-de-versiones-e-integración-y-despliegue-continuo](#c5---control-de-versiones--integración-y-despliegue-continuo)
3. [C1 - Buen-diseño-de-arquitectura-de-la-aplicación](#c1---buen-diseño-de-arquitectura-de-la-aplicación)
4. [C2 - Buena-implementación-en-Docker](#c2---buena-implementación-en-docker)
5. [C3 - Uso correcto del servidor web-como front](#c3---uso-correcto-del-servidor-web-como-front)
6. [C4 - Uso correcto del servidor de aplicaciones](#c4---uso-correcto-del-servidor-de-aplicaciones)
7. [C7 - Gestión básica de ficheros y artefactos necesarios para el despliegue](#c7---gestión-básica-de-ficheros-y-artefactos-necesarios-para-el-despliegue)
8. [C8 - Verificación básica de red del despliegue](#c8---verificación-básica-de-red-del-despliegue)

Destacar que varias de las evidencias que se encuentran en este apartado se pueden encontrar repetidas en el resto de la documentacion como dentro de este apartado, ya que se piede varias veces en diferentes criterios, se que es redundante, pero creo que facilita tamvien la correccion de los diferentes criterios de evaluacion.

---

### C6 - Documentación del proyecto

La documentacion del proyecto se encuentra en el README.md del repositorio, donde se explica detalladamente el proceso de despliegue, la aquirtectura de la aplicación y los endpoints de la API, entre otras cosas.

Tambien se cuenta con toda la documentacion del directorio `docs` donde se explica cada una de las partes del proyecto, queiro presuponer que el readme.md como el resto de evidencias en los otros documentos son suficiente evidencia para demostrar la correcta documentacion y funcionamiento del proyecto.

---

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

---

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

---

### C2 - Buena implementación en Docker

Las instrucciones para el desplegue en docker se encuentran tanto en este documento en [Proceso de Despliegue Documentado](#3-proceso-de-despliegue-documentado) como en el README.md del proyecto.

La aplicación cuenta con las imagenes publicadas en Docker Hub, a continuacion se comparte el enlace a cada una de las imagenes:

- SmartMark Backend: 
  - General: [adriandiaz24/smartmark-backend](https://hub.docker.com/repository/docker/adriandiaz24/smartmark-backend)
  - Tags: [adriandiaz24/smartmark-backend](https://hub.docker.com/repository/docker/adriandiaz24/smartmark-backend/tags)
- SmartMark Frontend:
  - General: [adriandiaz24/smartmark-frontend](https://hub.docker.com/repository/docker/adriandiaz24/smartmark-frontend)
  - Tags: [adriandiaz24/smartmark-frontend](https://hub.docker.com/repository/docker/adriandiaz24/smartmark-frontend/tags)

A continuación se muestra como se ejecuta el docker-compose para levantar la aplicación utilizando las imágenes de Docker Hub:

docker-compose up -d

![Docker-compose up -d](https://i.gyazo.com/f3a0f20d95041b3eeb29d4febdb72642.png)

docker-compose ps

![Docker-compose ps](https://i.gyazo.com/6f22ff1889ca60070c64c426835d0cbe.png)

docker-compose logs

![Docker-compose logs](https://i.gyazo.com/b3cb19ab27fe41ef410079e743de09d3.png)

curl http://localhost:3000

![curl backend](https://i.gyazo.com/f2851513f5dcc334e467dbad22185f0e.png)

curl http://localhost:3001

![curl frontend](https://i.gyazo.com/b731c04d167976a52d019b2c4047c66a.png)

---

### C3 - Uso correcto del servidor web como front

## Uso del Servidor Web como Front (Reverse Proxy)

Para mejorar el despliegue del frontend, se ha sustituido el servidor básico por **Nginx**. Este actúa como servidor de archivos estáticos para la aplicación React y, simultáneamente, como un proxy inverso (Reverse Proxy) para la API.

### 1. Configuración del Servidor y Proxy

Se han configurado dos rutas principales en Nginx. Todo el tráfico normal carga la interfaz web, pero cualquier petición que vaya a la ruta `/api` es redirigida internamente al contenedor del backend.

- **Fichero de configuración (`nginx.conf`):**
```nginx
server {
    listen 80;
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
    }
}
```

### Verificacion del Funcionamiento y evidencias

Al acceder a `http://localhost:3001`, se carga la aplicación React servida por Nginx. Al interactuar con la aplicación, las peticiones a la API se redirigen correctamente al backend, lo que se puede verificar en los logs de ambos contenedores, tambien a traves de docker-compose ps se puede ver que se exponen tanto el puerto 3001 del fronten con el 80 de nginx.

**Docker-compose ps**

![docker-compose ps](https://i.gyazo.com/a95df2d0ca397645be86d3d29e1c9bcd.png)

**Curl frontend**

![curl frontend](https://i.gyazo.com/2b2dfcce3d28bc026b92c58313ab806c.png)

**Curl backend**

![curl backend](https://i.gyazo.com/2aa2cbcb162919c7456c1e48158e0acf.png)

**Docker-compose logs frontend**

```
smartmark-frontend  | 172.18.0.1 - - [22/May/2026:16:17:20 +0000] "GET /api/links/stats/recent HTTP/1.1" 200 2 "http://localhost:3001/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0" "-"
smartmark-frontend  | 172.18.0.1 - - [22/May/2026:16:17:20 +0000] "GET /api/categories HTTP/1.1" 200 2 "http://localhost:3001/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0" "-"
smartmark-frontend  | 172.18.0.1 - - [22/May/2026:16:17:20 +0000] "GET /api/tags HTTP/1.1" 200 2496 "http://localhost:3001/" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36 OPR/131.0.0.0" "-"
```

---

### C4 - Uso correcto del servidor de aplicaciones

Se usa como servidor de aplicaciones uso Node.js junto con Express para el backend. Esto permite una separación clara de responsabilidades, con Node.js manejando la lógica de negocio y Express se encarga de escuchar las peticiones HTTP, procesarlas y enviar respuestas adecuadas al frontend.

#### Pruebas y evidencias

**Curl**

Se usa `curl -i http://localhost:3001/api/links` para verificar que el servidor de aplicaciones está respondiendo correctamente a las peticiones API.

![curl backend](https://i.gyazo.com/ef7dc4875706c5513314ba40971096c8.png)

**Logs**

Como se puede apreciar en los logs del backend, las peticiones a la API (Crear marcador) se están procesando correctamente, lo que confirma que el servidor de aplicaciones está funcionando, ademas de las peticiones de la API, se ve como funciona junto a la BD y en la imagen anterior como se envian los datos al frontend.

![logs backend](https://i.gyazo.com/6ab1537037e04f8876902c89cb3e84e3.png)

**Prueba de rendimiento**

Se usa el comando `Measure-Command { curl.exe -s http://localhost:3001/api/links > $null }` del PowerShell de Windows para medir el tiempo que tarda en responder el servidor de aplicaciones a una petición API, lo que ayuda a verificar que el servidor está respondiendo de manera eficiente.

![Prueba de rendimiento](https://i.gyazo.com/3e986a94d9aebd069e34f0b2e538ca43.png)

---

### C7 - Gestión básica de ficheros y artefactos necesarios para el despliegue

Para que SmartMark funcione sin problemas en cualquier ordenador, utilizamos Docker. En lugar de tener que instalar y configurar todo paso a paso de forma manual, hemos centralizado las instrucciones en unos pocos archivos clave. Estos archivos se encargan de arrancar la aplicación, asegurar que la base de datos no se pierda al apagar el sistema y evitar que se suban contraseñas o archivos basura a GitHub.

A continuación, se detallan los artefactos principales generados y los ficheros necesarios para el despliegue.

#### 1. Construcción de Artefactos (Dockerfiles)

Se han creado las instrucciones para empaquetar el código fuente de React y Express en imágenes (los artefactos). Cada entorno tiene su propio fichero que instala las dependencias (ignorando los `node_modules` locales) y expone los puertos necesarios.

Estos constructores se encuentran en `/frontend/Dockerfile` y `/backend/Dockerfile`.

```dockerfile
# Dockerfile para el backend de SmartMark
FROM node:20

# Establecer directorio de trabajo
WORKDIR /app

# Instalar herramientas de compilación necesarias para sqlite3
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copiar package.json
COPY package.json package-lock.json ./

# Instalar dependencias - forzar compilación de sqlite3
RUN npm install --production --build-from-source

# Copiar código fuente
COPY src ./src

# Exponer puerto
EXPOSE 3000

# Comando para iniciar el servidor
CMD ["npm", "start"]
```

En este caso es el constructor del backend, su funcionamiento es el siguiente:
1. Utiliza una imagen base de Node.js 20.
2. Establece el directorio de trabajo en `/app`, es decir todo lo que haga ahora se hará dentro de esa carpeta.
3. Instala las herramientas necesarias para compilar `sqlite3`
4. Copia los archivos `package.json` y `package-lock.json` al contenedor.
5. Ejecuta `npm install` con la opción `--build-from-source` esto hace que no se lo instale ya compilado sino el codigo fuente, lo cual ayuda a evitar incompatibilidades, en cuanto al --production lo que hace es que instala solo las dependencias necesarias para que funcione y no otras dependencias que son solo de desarrollo.
6. Copia el código fuente de la carpeta `src` al contenedor.
7. Expone el puerto 3000 para que se pueda acceder al backend desde fuera del contenedor.
8. Define el comando para iniciar el servidor con `npm start`.

```dockerfile
# Dockerfile multi-stage para el frontend de SmartMark
# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Argumentos de build
ARG REACT_APP_API_BASE_URL=http://localhost:3000/api

# Copiar package.json
COPY package.json package-lock.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Build de la aplicación con variable de entorno
RUN REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL npm run build

# Stage 2: Serve
FROM node:20

WORKDIR /app

# Instalar servidor HTTP ligero
RUN npm install -g serve

# Copiar archivos compilados del stage anterior
COPY --from=builder /app/build ./build

# Exponer puerto
EXPOSE 3001

# Comando para servir la aplicación
CMD ["serve", "-s", "build", "-l", "3001"]
```
Este es el constructor del frontend, su funcionamiento es el siguiente:
1. Utiliza una imagen base de Node.js 20-slim para la etapa de construcción
2. Establece el directorio de trabajo en `/app`.
3. Define un argumento (ARG, a diferencia de una variable de entorno ENV, un ARG solo está disponible durante la construcción de la imagen) para la URL del backend, con un valor por defecto.
4. Copia los archivos `package.json` y `package-lock.json` al contenedor
5. Ejecuta `npm install` para instalar las dependencias de la aplicación.
6. Copia todo el código fuente al contenedor, el `COPY . .` lo que dice es que vas a copiar todo lo hay en este directorio y los vas a copiar tal cual en el directorio de trabajo.
7. Ejecuta el comando de build de React, pasando la variable de entorno para que se compile con la URL correcta del backend.
8. En la segunda etapa, utiliza una imagen base de Node.js 20 para servir la aplicación.
9. Instala el paquete `serve` globalmente para servir la aplicación compilada.
10. Copia los archivos de `/app/build` de la etapa anterior `builder` al contenedor final en `./build`.
11. Expone el puerto 3001 para que se pueda acceder al frontend desde fuera del contenedor.
12. Define el comando para servir la aplicación con `serve`, el `-s` indica que cualquier ruta se redirige al `index.html`, el `build`hace referencia a la carpeta que tiene que mostrar y el `-l 3001` le dice que puierto debe escuchar.


#### 2. Configuración del Entorno (docker-compose.yml)

El archivo `docker-compose.yml` es el artefacto que orquesta la ejecución de ambos contenedores (backend y frontend) de forma conjunta, definiendo cómo se deben construir, qué puertos exponer, cómo se comunican entre sí y cómo se gestionan los volúmenes para la persistencia de datos.

```yaml
version: '3.8'

services:
  # Servicio Backend
  backend:
    image: adriandiaz24/smartmark-backend:latest
    container_name: smartmark-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - smartmark-db:/app/database
      - smartmark-uploads:/app/uploads
    networks:
      - smartmark-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/links"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Servicio Frontend
  frontend:
    image: adriandiaz24/smartmark-frontend:latest
    container_name: smartmark-frontend
    ports:
      - "3001:3001"
    environment:
      - REACT_APP_API_BASE_URL=http://localhost:3000/api
    depends_on:
      - backend
    networks:
      - smartmark-network
    restart: unless-stopped

networks:
  smartmark-network:
    driver: bridge

volumes:
  smartmark-db:
  smartmark-uploads:
```
Este es el archivo que se encarga por decirlo algun manera ordenar como se va a construir y ejecutar la aplicación.
El docker-compose define dos servicios principales: `backend` y `frontend`, cada uno con su propia configuración de imagen, puertos, variables de entorno, volúmenes y redes.

1. backend:
   1. Utiliza la imagen `adriandiaz24/smartmark-backend:latest` que se ha construido y subido a Docker Hub.
   2. Nombra al contenedor como `smartmark-backend`.
   3. Expone el puerto 3000 para que se pueda acceder a la API
   4. Define la variable de entorno `NODE_ENV=production` para que el backend se ejecute en modo producción (Esto hace que no muestre errores de desarrollo al usuario y aumenta su velocidad).
   5. Monta dos volúmenes: `smartmark-db` para la base de datos SQLite y `smartmark-uploads` para cualquier archivo que se quiera subir en el futuro (aunque actualmente no se suba nada, es una buena práctica tener un volumen para esto).
   6. Se conecta a la red `smartmark-network` para comunicarse con el frontend de forma segura.
   7. Configura el reinicio automático del contenedor a menos que se detenga manualmente.
   8. Define un healthcheck para verificar que la API está respondiendo correctamente, haciendo una petición a `/api/links` cada 30 segundos.
2. frontend:
    1. Utiliza la imagen `adriandiaz24/smartmark-frontend:latest` que se ha construido y subido a Docker Hub.
    2. Nombra al contenedor como `smartmark-frontend`.
    3. Expone el puerto 3001 para que se pueda acceder a la interfaz de usuario.
    4. Define la variable de entorno `REACT_APP_API_BASE_URL` para que el frontend sepa dónde está el backend.
    5. Indica que depende del servicio `backend`, lo que asegura que el backend se inicie antes que el frontend.
    6. Se conecta a la red `smartmark-network` para comunicarse con el backend de forma segura.
    7. Configura el reinicio automático del contenedor a menos que se detenga manualmente.
3. Define una red personalizada `smartmark-network` para aislar la comunicación entre los contenedores.
4. Define dos volúmenes `smartmark-db` y `smartmark-uploads` para asegurar la persistencia de datos incluso si los contenedores se detienen o eliminan.

#### 3. Configuración y Variables (.env)

Aunque el backend no utiliza un archivo `.env` y tiene las variables de entorno hardcodeadas en el código, el frontend sí utiliza un archivo `.env` para definir la URL base del API. Esto permite que el usuario pueda configurar fácilmente la conexión al backend sin tener que modificar el código fuente.

Actualemente se encuentra el .env.example en el directorio del frontend, este archivo sirve como plantilla para que el usuario sepa qué variables de entorno debe definir y con qué formato. El usuario simplemente tiene que copiar este archivo, renombrarlo a `.env` y modificar los valores según su configuración local.

```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

Como se puede ver el .env solo tiene una variable de entorno que es la URL base de la API, en este caso se facilita poder cambiar la URL de la API pero no oculta informacion sensible, en caso de que a fututo se hiciera llamdas a una API de pago por ejemplo a traves de algun token, se podria añadir esa variable de entorno al .env y asi ocultar esa informacion sensible a los usuarios finales, aunque en este caso no es necesario ya que no se hace ninguna llamada a una API de pago ni nada por el estilo.

Pero en caso de que se usar un token de pago por ejemplo, el .env.example mostraria como se llama la variable pero necesitaria que el usuario añadiera el valor de esa variable en su .env para que la aplicación funcionara correctamente, y asi se aseguraria que esa informacion sensible no se suba a GitHub ni se muestre en el código fuente.

---

### C8 - Verificación básica de red del despliegue

#### 1. Configuración y Mapeo de Puertos

En el archivo `docker-compose.yml` , se ha configurado el mapeo de puertos para ambos servicios:
- El backend expone el puerto 3000, mapeado al mismo puerto en el host, lo que permite acceder a la API a través de `http://localhost:3000/api`.

````yaml
  backend:
    image: adriandiaz24/smartmark-backend:latest
    container_name: smartmark-backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
````

- El frontend expone el puerto 3001, mapeado al mismo puerto en el host, lo que permite acceder a la interfaz de usuario a través de `http://localhost:3001`.

````yaml
  frontend:
    image: adriandiaz24/smartmark-frontend:latest
    container_name: smartmark-frontend
    ports:
      - "3001:3001"
    environment:
      - REACT_APP_API_BASE_URL=http://localhost:3000/api
````

#### 2. Verificación del Backend

Para verificar que el backend está funcionando correctamente, se puede hacer una petición a la API utilizando `curl` o cualquier herramienta de cliente HTTP como Postman.

En este caso vamos a verificar el backend funciona correctamente, para ello vamos a verificare tanto una llamada a la raiz de la API `http://localhost:3000/api` como a la ruta de los marcadores `http://localhost:3000/api/links`.

```bash
# Verificar la raíz de la API
curl http://localhost:3000/api
```

![curl raiz backend](https://i.gyazo.com/fae0290d64a75d271ad7ca504d91df1a.png)

```bash
# Verificar la ruta de los marcadores
curl http://localhost:3000/api/links
```

![curl links backend](https://i.gyazo.com/9270309006b68545acad9473a8e92a3d.png)

Como se puede ver el backend responde correctamente a ambas peticiones, lo que indica que el servicio está funcionando y la API está disponible en el puerto 3000.

#### 3. Verificación del Frontend

Para verificar que el frontend está funcionando correctamente, simplemente se puede acceder a `http://localhost:3001` en un navegador web. Si la aplicación se carga correctamente y muestra la interfaz de usuario, entonces el frontend está funcionando.

![SmartMark funcionando en el puerto 3001](https://i.gyazo.com/b385f88c7eb7920dfcce6d85b448a156.png)

Como se puede ver en la imagen con el docker-compose ps se puede verificar que ambos contenedores están corriendo y expuestos en los puertos correctos, lo que confirma que la aplicación está desplegada correctamente y accesible a través de los puertos configurados, haciendo que cualquier peticion que haga al puerto 3001 y al 3000 se redirija a esos puertos del contenedor dockerizado, lo que permite que el frontend y el backend se comuniquen correctamente y que el usuario pueda interactuar con la aplicación sin problemas.

![docker-compose ps](https://i.gyazo.com/3f391a2480d5f56a928182d8b69ceecc.png)
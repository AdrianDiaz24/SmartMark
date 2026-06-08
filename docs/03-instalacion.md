# Guía de Instalación - SmartMark

## 1. Requisitos Previos

### 1.1 Software Obligatorio

Antes de instalar SmartMark, asegúrate de tener instalados:

| Requisito | Versión Mínima | Instalación |
|-----------|-----------------|------------|
| **Node.js** | 20+ | [nodejs.org](https://nodejs.org) |
| **npm** | 7+ | Incluido con Node.js |
| **Git** | 2.29+ | [git-scm.com](https://git-scm.com) |

### 1.2 Verificar Instalación

```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar Git
git --version
```

### 1.3 Sistemas Operativos Soportados

- Windows 10+ (PowerShell o CMD)
- macOS 10.13+ 
- Linux (Ubuntu 18.04+, Debian 9+, etc.)

---

## 2. Instalación Local (Sin Docker)

### 2.1 Paso 1: Clonar el Repositorio

```bash
# Crear carpeta para el proyecto
mkdir SmartMark
cd SmartMark

# Clonar repositorio
git clone https://github.com/AdrianDiaz24/SmartMark.git .
```

### 2.2 Paso 2: Instalar Dependencias del Backend

```bash
# Navegar a carpeta backend
cd backend

# Instalar dependencias
npm install
```

**Dependencias principales instaladas**:
- `express` - Framework web
- `sqlite3` - Base de datos
- `axios` - Cliente HTTP
- `node-cron` - Tareas programadas
- `cors` - Control de CORS

### 2.3 Paso 3: Instalar Dependencias del Frontend

```bash
# Volver a la carpeta raíz
cd ..

# Navegar a carpeta frontend
cd frontend

# Instalar dependencias
npm install

```

**Dependencias principales instaladas**:
- `react` - Librería UI
- `react-router-dom` - Enrutamiento
- `axios` - Peticiones HTTP
- `react-icons` - Iconos SVG

### 2.4 Paso 4: Configurar Variables de Entorno

Solo el **Frontend** necesita variables de entorno. El backend viene configurado por defecto.

#### Frontend (`frontend/.env` - Crear archivo si no existe)

```env
# URL del API backend
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

**Nota:** El backend usa valores por defecto:
- Puerto: `3000` (en `src/server.js`)
- Base de datos: `./src/database/smartmark.db` (se crea automáticamente)
- CORS: `http://localhost:3001`

### 2.5 Paso 5: Iniciar Aplicación

#### Terminal 1 - Backend

```bash
cd backend
npm run start
```

**Output esperado:**
```
Servidor de SmartMark corriendo en http://localhost:3000
Conexión a la base de datos SQLite establecida correctamente.
Base de datos inicializada correctamente
========== VERIFICADOR DE URLs ==========
```

#### Terminal 2 - Frontend

```bash
cd frontend
npm start
```

**Output esperado:**
```
Compiled successfully!

You can now view smartmark in the browser.

  Local:            http://localhost:3001
  On Your Network:  http://192.168.x.x:3001

Note that the development build is not optimized.
```

### 2.6 Paso 6: Verificar Funcionamiento

1. **Acceder a la aplicación**:
   - Abre navegador en `http://localhost:3001`
   - Deberías ver la interfaz de SmartMark

2. **Verificar Backend API**:
   ```bash
   curl http://localhost:3000/api
   ```
   **Respuesta esperada:**
   ```json
   {
     "message": "Bienvenido a la API de SmartMark",
     "version": "1.0.0",
     "endpoints": {
       "links": "/api/links",
       "categories": "/api/categories",
       "tags": "/api/tags",
       "urlVerification": "/api/url-verification"
     }
   }
   ```

3. **Probar creación de marcador**:
   - Click en botón "+" del header
   - Pega una URL cualquiera
   - Verifica que los metadatos se extraen correctamente

---

## 3. Instalación con Docker (RECOMENDADO)

### 3.1 Requisitos Previos Docker

| Requisito | Versión Mínima |
|-----------|-----------------|
| **Docker** | 20.10+ |
| **Docker Compose** | 1.29+ |

**Verificar instalación:**
```bash
docker --version
docker-compose --version
```

### 3.2 Opción A: Docker Compose (MÁS FÁCIL)

#### Paso 1: Descargar archivo docker-compose.yml

```bash
# Crear carpeta
mkdir smartmark-docker
cd smartmark-docker

# Descargar docker-compose.yml
curl -o docker-compose.yml https://raw.githubusercontent.com/AdrianDiaz24/SmartMark/main/docker-compose.yml
```

#### Paso 2: Descargar imágenes

```bash
docker-compose pull
```

**Output esperado:**
```
Pulling backend  ... done
Pulling frontend ... done
```

#### Paso 3: Iniciar servicios

```bash
docker-compose up -d
```

**Output esperado:**
```
Creating smartmark-backend  ... done
Creating smartmark-frontend ... done
```

#### Paso 4: Verificar contenedores

```bash
docker-compose ps
```

**Output esperado:**
```
NAME                 COMMAND                  SERVICE      STATUS      PORTS
smartmark-backend    "npm start"             backend      Up 2 mins   3000/3000
smartmark-frontend   "serve -s build -l..." frontend     Up 2 mins   3001/3001
```

#### Paso 5: Acceder a la aplicación

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000/api

#### Detener servicios

```bash
docker-compose stop
```

#### Reiniciar servicios

```bash
docker-compose start
```

#### Eliminar servicios (con datos)

```bash
docker-compose down
```

#### Eliminar servicios y volúmenes (Borra la base de datos)

```bash
docker-compose down -v
```

### 3.3 Opción B: Imágenes Individuales

Si prefieres ejecutar contenedores manualmente:

#### Backend

```bash
docker run -d \
  -p 3000:3000 \
  --name smartmark-backend \
  adriandiaz24/smartmark-backend:latest
```

#### Frontend

```bash
docker run -d \
  -p 3001:3001 \
  --name smartmark-frontend \
  adriandiaz24/smartmark-frontend:latest
```

#### Ver logs

```bash
# Backend
docker logs smartmark-backend -f

# Frontend
docker logs smartmark-frontend -f
```

---

## 4. Variables de Entorno Detalladas

### 4.1 Backend 

El backend usa valores hardcodeados en el código, sin necesidad de `.env`:

| Configuración            | Valor                                                 |
|--------------------------|-------------------------------------------------------|
| **PORT**                 | `3000`                                                | 
| **NODE_ENV**             | `development`                                         | 
| **DATABASE_PATH**        | `./src/database/smartmark.db`                         | 
| **CORS_ORIGIN**          | `http://localhost:3001` o URL del frontend desplegado | 
| **JWT_SECRET**           | `Codigo Alfanumerico`                                 | 
| **JWT_EXPIRE**           | `7d`                                                  | 
| **VERIFICATION_INTERVAL** | `604800000`                                           | 
| **MAX_FILE_SIZE_MB**     | `5 MB`                                                | 
| **HTTP_TIMEOUT**         | 5000                                                  |

**Para cambiar estos valores, edita directamente los archivos correspondientes.**

### 4.2 Frontend (Archivo .env)

| Variable | Valor Defecto | Descripción | 
|----------|---------------|-------------|
| `REACT_APP_API_BASE_URL` | `http://localhost:3000/api` | URL base del API backend |

**Archivo `.env`:**
```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
```



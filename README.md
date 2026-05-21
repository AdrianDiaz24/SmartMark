# SmartMark

> **Gestor inteligente de marcadores con verificación automática de URLs, asignacion automatica de tags y organización jerárquica, pensada para desarolladores**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-20+-green.svg)
![React](https://img.shields.io/badge/React-18+-blue.svg)
![SQLite](https://img.shields.io/badge/SQLite-3.51+-cyan.svg)
![Docker](https://img.shields.io/badge/Docker-Supported-2496ED.svg)
![Docker Compose](https://img.shields.io/badge/Docker%20Compose-Supported-2496ED.svg)

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Características](#características)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Despliegue de la aplicación web](#despliegue-de-la-aplicación-web)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Tecnologías](#tecnologías)
- [Verificación de URLs](#verificación-de-urls)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## Descripción

**SmartMark** es una aplicación web de gestión de marcadores (bookmarks) diseñada para usuarios que necesitan organizar, categorizar y mantener sus enlaces de forma eficiente, centrada en el mundo tecnologico, debido a la implementacion de llamadas a la API de GitHub y Tags por defectos de diferentes tecnologias y lenguajes de programacion. 

Características destacadas:
- **Carpetas jerárquicas** con subcarpetas ilimitadas
- **Etiquetas personalizables** con colores
- **Búsqueda avanzada** por título, tags o carpeta
- **Verificación semanal** automática de URLs
- **Portadas personalizadas** para marcadores
- **Estadísticas** de acceso y uso

---

## Características

### Gestión de Marcadores
- Crear, editar y eliminar marcadores
- Subir portadas personalizadas (PNG, JPG, SVG)
- Asignar múltiples tags a cada marcador
- Registrar última apertura automáticamente
- Clasificar en carpetas o dejar en sección general

### Organización
- Carpetas con estructura jerárquica (sin límite de profundidad)
- Subcarpetas dentro de carpetas
- Etiquetas globales reutilizables
- Tags por defecto del sistema

### Verificación de URLs
- Escaneo automático cada 7 días
- Detección de URLs inválidas
- Indicador visual (borde naranja) en cards
- Log de verificaciones en BD

### Visualización
- Vista en grid
- Vista en lista
- Filtros por carpeta y tags
- Búsqueda en tiempo real

### Información GitHub
- Extrae estrellas, forks y lenguajes de repositorios
- Información actualizada automáticamente

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** 20+ ([descargar](https://nodejs.org))
- **npm** 7+ (incluido con Node.js)
- **Git** ([descargar](https://git-scm.com))

Verificar versiones:
```bash
node --version
npm --version
```

---

## Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/AdrianDiaz24/SmartMark.git
cd SmartMark
```

### 2. Instalar dependencias del Backend
```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend
```bash
cd ../frontend
npm install
```

---

## Configuración

### Backend

1. **Puerto por defecto:** `3000`
   - Modificar en `src/server.js` si necesitas cambiar

2. **Base de datos SQLite:**
   - Ubicación: `src/database/smartmark.db`
   - Se crea automáticamente en el primer inicio

### Frontend

1. **Puerto por defecto:** `3001`
   - Configurado en `package.json`

2. **URL del Backend:**
   - Por defecto: `http://localhost:3000`
   - Verificar en `src/services/api.js`

---

## Despliegue de la aplicación web

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
- **Docker Compose** ([descargar](https://docs.docker.com/compose/install/))

Verificar instalación:
```bash
docker --version
docker-compose --version
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

**Eliminar contenedores y volúmenes (¡CUIDADO!):**
```bash
docker-compose down -v
```

### Opción 2: Descargar Imágenes Individuales desde Docker Hub

Si prefieres ejecutar los contenedores sin Docker Compose:

#### Backend
- **Repositorio:** [adriandiaz24/smartmark-backend](https://hub.docker.com/r/adriandiaz24/smartmark-backend)

```bash
docker run -d -p 3000:3000 --name smartmark-backend adriandiaz24/smartmark-backend:latest
```

#### Frontend
- **Repositorio:** [adriandiaz24/smartmark-frontend](https://hub.docker.com/r/adriandiaz24/smartmark-frontend)

```bash
docker run -d -p 3001:3001 --name smartmark-frontend adriandiaz24/smartmark-frontend:latest
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

## Estructura del Proyecto

```
SmartMark/
│
├── backend/
│   ├── src/
│   │   ├── server.js                 # Servidor principal
│   │   ├── config/
│   │   │   └── cronJobConfig.js      # Configuración verificación URLs
│   │   ├── controllers/              # Lógica de negocio
│   │   ├── routes/                   # Rutas API
│   │   ├── services/                 # Servicios auxiliares
│   │   ├── middleware/               # Middlewares Express
│   │   └── database/
│   │       └── db.js                 # Inicialización BD
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.js                    # Componente raíz
│   │   ├── index.js                  # Punto de entrada
│   │   ├── components/               # Componentes React
│   │   ├── pages/                    # Páginas
│   │   ├── services/                 # Servicios API
│   │   ├── hooks/                    # Custom hooks
│   │   ├── context/                  # Contextos React
│   │   └── assets/                   # Imágenes y recursos
│   ├── public/
│   │   └── index.html
│   └── package.json
│
└── README.md
```

---

## API Endpoints

### Marcadores
```
GET    /api/links                     # Obtener todos los marcadores
GET    /api/links/:id                 # Obtener marcador por ID
POST   /api/links                     # Crear nuevo marcador
PUT    /api/links/:id                 # Actualizar marcador
DELETE /api/links/:id                 # Eliminar marcador
POST   /api/links/:id/access          # Registrar acceso
```

### Carpetas
```
GET    /api/categories                # Obtener todas las carpetas
GET    /api/categories/:id            # Obtener carpeta por ID
POST   /api/categories                # Crear carpeta
PUT    /api/categories/:id            # Actualizar carpeta
DELETE /api/categories/:id            # Eliminar carpeta
```

### Tags
```
GET    /api/tags                      # Obtener todos los tags
POST   /api/tags                      # Crear nuevo tag
PUT    /api/tags/:id                  # Actualizar tag
DELETE /api/tags/:id                  # Eliminar tag
```

### Verificación de URLs
```
POST   /api/url-verification/verify   # Ejecutar verificación manual
GET    /api/url-verification/status/:id  # Obtener estado de URL
```

---

## Verificación de URLs

### ¿Cómo funciona?

1. **Ciclo de 7 días:** Se ejecuta automáticamente cada 7 días
2. **Sin cron fijo:** Perfecta para servidores autohosteados
3. **Al iniciar:** Verifica si pasaron 7 días desde última ejecución
4. **Indicador visual:** URLs inválidas muestran borde naranja

### Configuración

Modificar intervalo en `backend/src/config/cronJobConfig.js`:
```javascript
const VERIFICATION_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 días
```

### Comportamiento

```
Servidor inicia
    ↓
¿Pasaron 7 días desde última verificación?
    ├─ SÍ  → Verifica todas las URLs
    └─ NO  → Espera al próximo ciclo
```

---

## Tecnologías

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **SQLite3** - Base de datos ligera
- **Axios** - Cliente HTTP
- **node-cron** - Tareas programadas

### Frontend
- **React 18** - Librería UI
- **React Router** - Enrutamiento
- **CSS3** - Estilos
- **Axios** - Peticiones HTTP
- **Context API** - Gestión de estado

### Herramientas
- **npm** - Gestor de paquetes
- **Babel** - Transpilador
- **Webpack** - Bundler

---

## Modelo de Datos

### Tablas principales

#### Marcadores
```sql
id, titulo, url, descripcion, portada, categoria_id,
fecha_creacion, ultima_apertura, url_estado, ultima_verificacion,
github_stars, github_forks, github_watchers, github_languages
```

#### Categorias
```sql
id, nombre, padre_id, fecha_creacion
```

#### Tags
```sql
id, nombre, color, fecha_creacion, es_default
```

#### Relaciones
- `Marcadores_Tags` (muchos a muchos)
- `Categorias_Tags` (muchos a muchos)

---

## Solución de Problemas

### El backend no inicia
```bash
# Verificar puerto 3000 no esté en uso
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows
```

### La BD está corrupta
```bash
# Eliminar y recrear
rm backend/src/database/smartmark.db
npm start  # Backend recreará la BD
```

### Frontend no conecta con Backend
- Verificar que Backend esté corriendo en puerto 3000
- Revisar URL en `frontend/src/services/api.js`
- Verificar CORS habilitado en Backend

### URLs no se marcan como inválidas
- Chequear logs del Backend
- Verificar que `verification_log` exista en BD
- Ejecutar verificación manual vía API

---

## Variables de Entorno

Estructura para `.env.local`:
```env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_API_TIMEOUT=5000
```

---

## Contribución

Las contribuciones son bienvenidas. Para cambios mayores:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/NewFeature`)
3. Commit tus cambios (`git commit -m 'Add NewFeature'`)
4. Push a la rama (`git push origin feature/NewFeature`)
5. Abre un Pull Request

---

## Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## Autor

**SmartMark** fue desarrollado como proyecto de gestión de marcadores.

- GitHub: [@AdrianDiaz24](https://github.com/AdrianDiaz24)
- Email: adriandiazangulo23@gmail.com

---

## Soporte

¿Encuentras un bug? ¿Tienes una sugerencia?

- **Email:** adriandiazangulo23@gmail.com
- **Issues:** [Reportar en GitHub](https://github.com/AdrianDiaz24/smartmark/issues)
- **Discussiones:** [Forum](https://github.com/AdrianDiaz24/smartmark/discussions)

---

## Agradecimientos

- Comunidad React
- Comunidad Node.js
- Todos los contribuidores

---

## Changelog

### v1.0.0 (2026-05-19)
- Gestión completa de marcadores
- Organización jerárquica de carpetas
- Sistema de tags personalizable
- Verificación automática de URLs
- Interfaz oscura responsive

---

**Made with love for bookmark lovers**

---

## Roadmap

- [ ] Exportar/Importar marcadores (JSON, HTML)
- [ ] Realizar version en ingles
- [ ] Añadir nuevas API´s como la de Youtube para obtener estadísticas de canales o videos
- [ ] Extensión de navegador
- [ ] Mejorar manejo de portada
- [ ] Añadir funcionalidad de favoritos
- [ ] Mejorar interfaz de usuario
- [ ] Añadir mas opciones de filtrado y búsqueda

---

**Última actualización:** 19/05/2026

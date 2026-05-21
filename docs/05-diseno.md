# Diseño - SmartMark

## 1. Diagrama Entidad-Relación de la Base de Datos

### Estructura de Tablas

![Diagrama Entidad-Relacion](https://i.gyazo.com/669ab8a899cf912ccda1307b6f222371.png)

### Relaciones Clave

| Relación | Tipo | Descripción |
|----------|------|-------------|
| Categorias (padre_id) → Categorias (id) | 1:N (Auto-referenciada) | Jerarquía de carpetas (subcarpetas) |
| Marcadores → Categorias | N:1 | Cada marcador pertenece a una carpeta |
| Marcadores ↔ Tags | M:N (tabla intermedia) | Un marcador puede tener múltiples tags |
| Categorias ↔ Tags | M:N (tabla intermedia) | Una carpeta puede asociarse a tags |

---

## 2. Diagrama de Casos de Uso

![Diagrama de Casos de Uso](https://i.gyazo.com/394ea9a7f09e20c923745bd17a17f82c.png)

---

## 3. Diagramas de Flujo de Procesos Principales

### 3.1 Crear Nuevo Marcador

![Crear Nuevo Marcador](https://i.gyazo.com/766062aa3879ef531ae2c5c60620f121.png)

### 3.2 Verificación de URLs

![Verificación de URLs](https://i.gyazo.com/7d3d7d955693510e44a7bdaf750abba1.png)

### 3.3 Búsqueda y Filtrado

![Búsqueda y Filtrado](https://i.gyazo.com/16d327515ef41615c28313344825f751.png)

---

## 4. Arquitectura de la Aplicación

### 4.1 Estructura General

```
┌────────────────────────────────────────────────────────────────┐
│                        NAVEGADOR (USUARIO)                     │
│                       http://localhost:3001                    │
└────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
        ▼                                           ▼
┌──────────────────────┐       ┌──────────────────────────┐
│  Frontend (React)    │       │   Backend (Express.js)   │
│ http://localhost:3001│       │  http://localhost:3000   │
├──────────────────────┤       ├──────────────────────────┤
│ - Components         │       │ - Controllers            │
│ - Pages              │       │ - Routes                 │
│ - Services (API)     │       │ - Services               │
│ - Context (Estado)   │       │ - Middleware             │
│ - Hooks              │       │ - Database Connection    │
└──────────────────────┘       └──────────────────────────┘
        │                               │
        │                               │
        └───────┬──────────────────┬────┘
                │ HTTP (REST API)  │
                │ JSON             │
                │
                ▼
        ┌──────────────────────┐
        │  SQLite Database     │
        │  smartmark.db        │
        ├──────────────────────┤
        │ - Categorias         │
        │ - Tags               │
        │ - Marcadores         │
        │ - Marcadores_Tags    │
        │ - verification_log   │
        └──────────────────────┘
```

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

### 4.2 Capas de la Aplicación

#### Frontend (React)
- **Presentación**: Components React
- **Routing**: React Router
- **Consumición API**: Services con Axios
- **Gestión de estado**: Context API
- **Hooks personalizados**: useToast, useSearch

#### Backend (Node.js + Express)
- **Rutas**: Define endpoints REST
- **Controladores**: Lógica de negocio
- **Servicios**: Scraping, verificación URLs, GitHub API
- **Middleware**: CORS, manejo de errores
- **Base de datos**: SQLite con consultas SQL

#### Base de Datos
- **Persistencia**: Archivos SQLite
- **Relaciones**: FK con cascade delete
- **Integridad**: Constraints, tipos de datos

---

## 5. Diseño de la API

### 5.1 Endpoints de Marcadores

#### GET /api/links
**Obtener todos los marcadores (con filtros opcionales)**
```
parametros:
- carpeta: ID de carpeta (filtrar por carpeta)
- tag: ID de tag (filtrar por tag)
- search: Texto para buscar (LIKE en título/descripción)

Respuesta (200 OK):
[
  {
    id: 1,
    titulo: "React Docs",
    url: "https://react.dev",
    descripcion: "Documentación oficial de React",
    portada: null,
    categoria_id: 2,
    fecha_creacion: "2026-05-20T10:00:00Z",
    ultima_apertura: "2026-05-21T14:00:00Z",
    github_stars: 0,
    github_forks: 0,
    url_estado: "valida",
    tags: [1, 3]
  },
  ...
]
```

#### GET /api/links/:id
**Obtener marcador específico**
```
Respuesta (200 OK):
{
  id: 1,
  titulo: "React Docs",
  url: "https://react.dev",
  descripcion: "Documentación oficial de React",
  portada: <binary>,
  categoria_id: 2,
  fecha_creacion: "2026-05-20T10:00:00Z",
  ultima_apertura: "2026-05-21T14:00:00Z",
  github_stars: 215000,
  github_forks: 46000,
  github_watchers: 215000,
  github_languages: ["JavaScript", "TypeScript"],
  url_estado: "valida",
  ultima_verificacion: "2026-05-21T00:00:00Z",
  tags: [1, 3, 5]
}
```

#### POST /api/links
**Crear nuevo marcador**
```
Body (form-data):
{
  titulo: "React Docs",
  url: "https://react.dev",
  descripcion: "...",
  portada: <file>,
  categoria_id: 2,
  tags: [1, 3],
  github_stars: 215000,
  github_forks: 46000,
  github_watchers: 215000,
  github_languages: ["JavaScript"]
}

Respuesta (201 Created):
{
  id: 1,
  titulo: "React Docs",
  ...
}

Error (400 Bad Request):
{
  error: "URL y nombre son requeridos"
}
```

#### PUT /api/links/:id
**Actualizar marcador**
```
Body:
{
  titulo: "React Docs Actualizado",
  descripcion: "...",
  categoria_id: 3,
  tags: [1, 2]
}

Respuesta (200 OK):
{
  id: 1,
  titulo: "React Docs Actualizado",
  ...
}
```

#### DELETE /api/links/:id
**Eliminar marcador**
```
Respuesta (200 OK):
{
  message: "Marcador eliminado correctamente"
}
```

#### POST /api/links/:id/access
**Registrar acceso a marcador**
```
Respuesta (200 OK):
{
  message: "Acceso registrado",
  ultima_apertura: "2026-05-21T14:30:00Z"
}
```

### 5.2 Endpoints de Carpetas (Categorías)

#### GET /api/categories
**Obtener todas las carpetas (con estructura jerárquica)**
```
Respuesta (200 OK):
[
  {
    id: 1,
    nombre: "Frontend",
    padre_id: null,
    fecha_creacion: "2026-05-20T10:00:00Z",
    children: [
      {
        id: 2,
        nombre: "React",
        padre_id: 1,
        children: []
      }
    ]
  },
  ...
]
```

#### POST /api/categories
**Crear nueva carpeta**
```
Body:
{
  nombre: "React",
  padre_id: 1  // null si es raíz
}

Respuesta (201 Created):
{
  id: 2,
  nombre: "React",
  padre_id: 1,
  fecha_creacion: "2026-05-21T10:00:00Z"
}
```

#### PUT /api/categories/:id
**Actualizar carpeta**
```
Body:
{
  nombre: "React Avanzado"
}

Respuesta (200 OK):
{
  id: 2,
  nombre: "React Avanzado",
  ...
}
```

#### DELETE /api/categories/:id
**Eliminar carpeta**
```
Respuesta (200 OK):
{
  message: "Carpeta eliminada correctamente"
}
```

### 5.3 Endpoints de Tags

#### GET /api/tags
**Obtener todos los tags**
```
Respuesta (200 OK):
[
  {
    id: 1,
    nombre: "JavaScript",
    color: "FFE943",
    fecha_creacion: "2026-05-20T10:00:00Z",
    es_default: 1
  },
  ...
]
```

#### POST /api/tags
**Crear nuevo tag**
```
Body:
{
  nombre: "React",
  color: "33DCCB"
}

Respuesta (201 Created):
{
  id: 25,
  nombre: "React",
  color: "33DCCB",
  es_default: 0
}
```

#### PUT /api/tags/:id
**Actualizar tag**
```
Body:
{
  nombre: "React.js",
  color: "33DCCB"
}

Respuesta (200 OK):
{
  id: 25,
  nombre: "React.js",
  color: "33DCCB",
  ...
}
```

#### DELETE /api/tags/:id
**Eliminar tag**
```
Respuesta (200 OK):
{
  message: "Tag eliminado correctamente"
}
```

### 5.4 Endpoints de Verificación de URLs

#### GET /api
**Endpoint raíz - Información de API**
```
Respuesta (200 OK):
{
  message: "Bienvenido a la API de SmartMark",
  version: "1.0.0",
  endpoints: {
    links: "/api/links",
    categories: "/api/categories",
    tags: "/api/tags",
    urlVerification: "/api/url-verification"
  }
}
```

#### POST /api/url-verification/verify
**Ejecutar verificación manual de URLs**
```
Respuesta (200 OK):
{
  message: "Verificación completada",
  total_marcadores: 45,
  marcadores_validos: 43,
  marcadores_invalidos: 2,
  errores: ["ID 10: Timeout", "ID 25: Error de conexión"],
  timestamp: "2026-05-21T14:30:00Z"
}
```

#### GET /api/url-verification/status/:marcadorId
**Obtener estado de verificación de una URL**
```
Respuesta (200 OK):
{
  marcador_id: 1,
  url: "https://react.dev",
  url_estado: "valida",
  ultima_verificacion: "2026-05-21T00:00:00Z",
  status_code: 200
}
```



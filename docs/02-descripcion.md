# Descripción Detallada de SmartMark

## 1. Descripción Detallada de Funcionalidades Principales

### 1.1 Gestión Completa de Marcadores (CRUD)

#### Crear un Marcador
- **Flujo**: Usuario escribe URL → Sistema extrae metadatos → Usuario asigna carpeta y tags → Se guarda.
- **Metadatos extraídos automáticamente**:
  - Título (del `<title>` HTML o `og:title`)
  - Descripción (del meta tag `description` u `og:description`)
- **Entrada manual opcional**: El usuario puede editar o complementar cualquier campo.

**Ejemplo práctico**:
```
Usuario pega: https://github.com/AdrianDiaz24/SmartMark
Sistema extrae:
  - Título: "GitHub - AdrianDiaz24/SmartMark"
  - Descripción: "Contribute to AdrianDiaz24/SmartMark development by creating an account on GitHub."
El usuario asigna: Carpeta "Proyecto".
La aplicacion revisa las tecnologias usadas y autoetiqueta con las tecnologias que se encuentre en los tags
```

#### Leer/Visualizar Marcadores
- **Vistas disponibles**:
  1. **Vista Grid**: Tarjetas visuales con portada grande, título, descripción y tags.
  2. **Vista Lista**: Formato compacto con filas (portada pequeña, título, descripción, tags).
- **Información mostrada**:
  - Portada visual
  - Título y descripción
  - Tags asignados (con color personalizado)
  - Indicador de URL rota (borde rojo si está inactiva)
  - Si es GitHub: estrellas, forks, lenguaje principal


#### Actualizar un Marcador
- **Campos editables**: Título, descripción, portada personalizada, carpeta, tags.
- **Flujo**: Click en el icono de editar → Página de edición → Cambios → Guardar.
- **Especial**: Posibilidad de subir portada personal (PNG, JPG, SVG).


#### Eliminar un Marcador
- **Confirmación**: Modal de seguridad pidiendo confirmación.
- **Cascade**: Los tags no se eliminan (reutilizables), solo se desvinculan.

---

### 1.2 Sistema de Organización Jerárquica

#### Carpetas (Categorías)
- **Estructura**: Árbol de categorías con subcarpetas **ilimitadas**.
- **Funciones**:
  - Crear carpeta vacía o con padre específico
  - Renombrar carpeta
  - Eliminar carpeta (con opción de mover contenido o eliminar todo)
- **Visualización**: Sidebar izquierdo con estructura de árbol.

**Ejemplo de estructura**:
```
Desarrollo
├── Frontend
│   ├── React
│   ├── Vue
│   └── CSS
└── Backend
    ├── Node.js
    └── Python


Recursos
├── Documentación
├── Tutoriales
└── Foros
```

#### Etiquetas (Tags)
- **Características**:
  - Tags globales reutilizables en múltiples marcadores.
  - Cada tag tiene color personalizado hexadecimal.
  - Sistema de "tags por defecto" predefinidos (ej. #React, #Node, #Python, etc.).
  - Se asignan automaticaticamente si detecta el nombre del tag al hacer scraping.
- **Asignación**: Un marcador puede tener múltiples tags; un tag puede tener múltiples marcadores.
- **Visualización**: Badges de color en las tarjetas de marcadores.


**Ejemplo**:
```
Tags creados:
- #React (color azul)
- #Node (color verde)
- #TypeScript (color naranja)
- #Importante (color rojo)

Un marcador puede ser: #React, #TypeScript, #Importante
```

---

### 1.3 Búsqueda y Filtrado en Tiempo Real

#### Búsqueda por Texto
- **Campos buscables**: Título, descripción, contenido de página extraído.
- **Ubicación en código**:

#### Filtrado por Carpeta
- **Interfaz**: Selector en sidebar izquierdo ("Todos los marcadores" o carpeta específica).
- **Comportamiento**: Mostrar solo marcadores de esa carpeta 
- **URL**: Se guarda como parámetro `?carpeta=ID`

#### Filtrado por Tags
- **Interfaz**: Click en badge de tag en sidebar.
- **Comportamiento**: Mostrar solo marcadores con ese tag
- **URL**: Se guarda como parámetro `?tag=ID`

#### Combinación de Filtros
- **Comportamiento**: Es posible combinar carpeta + tag simultáneamente en URL.

---

### 1.4 Verificación Automática de URLs (Mantenimiento Proactivo)

#### Cron Job Semanal
- **Intervalo**: Se ejecuta automáticamente cada 7 días (5 minutos por ahora para poder probarlo bien).
- **Desde dónde**: Al iniciar el backend, se verifica si pasaron 7 días desde la última ejecución almacenada en BD.
- **Qué hace**: 
  1. Recorre todos los marcadores guardados.
  2. Realiza HEAD request a cada URL.
  3. Registra el estado (200, 404, timeout, etc.).
  4. Marca visualmente las URLs rotas (borde rojo en la tarjeta).

#### Indicadores Visuales
- **URL válida**: Borde normal en tarjeta.
- **URL rota**: Borde **rojo** en tarjeta.

**Ejemplo de log en BD** (tabla `verification_log`):
```
id | link_id | url                          | status_code | ultima_verificacion
1  | 15      | https://github.com/facebook/react | 200        | 2026-05-20 14:32:00
2  | 23      | https://ejemplo.com/tutorial      | 404        | 2026-05-20 14:32:15
```

---

### 1.5 Integración con GitHub API

#### Información Dinámicamente Extraída
Para URLs que apunten a repositorios de GitHub, se muestran:
- **Estrellas** (contador de estrellas)
- **Forks** (número de forks)
- **Lenguaje principal** (ej. JavaScript, Python, etc.)
- **Watchers** (Visualizaciones)


---

## 2. Interfaz de Usuario y Experiencia de Usuario (UI/UX)

### 2.1 Estructura General

#### Componentes Principales
1. **Header** (`Header.js`): Logo, título, botón para crear marcadores.
2. **Sidebar** (`Sidebar.js`): Navegación de carpetas y tags, botones "+" para crear.
3. **FilterBar** (`FilterBar.js`): Buscador de texto en tiempo real.
4. **GridCard/LinkCard** (`GridCard.js`, `LinkCard.js`): Visualización de marcadores.
5. **Modales**: 
   - `CreateBookmarkModal.js`: Crear nuevo marcador.
   - `CreateFolderModal.js`: Crear carpeta.
   - `CreateTagModal.js`: Crear tag.

### 2.2 Diseño Visual

#### Color y Tema
- **Tema**: Interfaz oscura.
- **Paleta**:
  - Fondo principal: Gris oscuro (#1a1a1a)
  - Fondo secundario: Gris más claro (#2a2a2a)
  - Texto principal: Blanco (#ffffff)
  - Alertas: Rojo para URLs rotas y errores y verdes para acciones realizadas correctamente.

#### Tipografía
- **Fuentes**: System fonts nativos del sistema operativo:
  - macOS/iOS: San Francisco (-apple-system)
  - Windows: Segoe UI
  - Android/Chrome: Roboto
  - Fallback: sans-serif genérico
- **Ventajas**: Carga rápida, consistencia con el SO, sensación nativa.
- **Tamaños**: Jerárquico (títulos > subtítulos > body text).

#### Espaciado y Responsive
- **Breakpoints**: Diseño adaptable a diferentes tamaños de pantallas.
- **Cuadrículas**: Grid CSS para disposición de cards.


## 3. Usuarios Objetivo y Casos de Uso

### 3.1 Usuarios Objetivo

#### Perfil 1: Estudiante de Programación
- **Descripción**: Estudiante de DAW, grado en Informática o bootcamp.
- **Necesidad**: Organizar tutoriales, documentación oficial, foros de Stack Overflow.
- **Caso de uso típico**:
  - Guarda 50+ URLs durante el curso (React, Node.js, SQL).
  - Necesita encontrar rápidamente el tutorial de "Forms en React" guardado hace 2 meses.
  - Agrupa por carpetas (Frontend, Backend, DevOps) y tags (#React, #Importante).

#### Perfil 2: Desarrollador Senior
- **Descripción**: Ingeniero de software con 5+ años de experiencia.
- **Necesidad**: Mantener biblioteca de referencias técnicas, librerías, soluciones a problemas recurrentes.
- **Caso de uso típico**:
  - Guarda repositorios de GitHub con diferentes soluciones arquitectónicas.
  - Usa tags para marcar "Testing", "Performance", "Security".
  - Verifica semanalmente que sus referencias de recursos no estén rotas.
  - Comparte links con compañeros en presentaciones.

#### Perfil 3: Freelancer/Agencia Web
- **Descripción**: Desarrollador independiente o pequeña agencia.
- **Necesidad**: Gestionar recursos reutilizables, templates, herramientas SaaS útiles.
- **Caso de uso típico**:
  - Guarda templates de proyectos, librerías reutilizables, documentación de clientes.
  - Clasifica por proyecto (Cliente A, Cliente B, Internos).
  - Busca rápidamente soluciones antes de empezar un proyecto.

#### Perfil 4: Diseñador UI/UX
- **Descripción**: Diseñador que también implementa o colabora con desarrolladores.
- **Necesidad**: Guardar inspiración, paletas de colores, recursos de diseño, herramientas.
- **Caso de uso típico**:
  - Galopé de diseño (color palettes, tipografías, librerías de componentes).
  - Referencias visuales de competitors.
  - Herramientas de diseño (Figma plugins, assets online).

---

### 3.2 Casos de Uso Específicos

#### Caso 1: Investigación de tecnología nueva

Usuario: Estudiante de DAW

Objetivo: Aprender Kubernetes

Acciones:
1. Busca "Kubernetes" en Google, encuentra 10 recursos útiles
2. Para cada uno, abre SmartMark y pega la URL
3. Sistema extrae título, descripción, imagen automáticamente
4. Usuario asigna: Carpeta "DevOps", Tags "#Kubernetes #Learning #Importante"
5. Al día siguiente, abre SmartMark y busca "Kubernetes" → encuentra 10 recursos
6. Comienza a estudiares siguiendo los recursos organizados visualmente


#### Caso 2: Seguimiento de URLs de recursos críticos

Usuario: Desarrollador Senior

Objetivo: Mantener actualizada una lista de librerías de seguridad

Acciones:
1. Crea carpeta "Security Libraries" con 15 enlaces a npm packages
2. Cada semana, el sistema verifica automáticamente que siguen disponibles
3. Si alguno muestra error 404, aparece con borde naranja
4. Usuario es alertado: "Recurso 'bcryptjs' ya no disponible. Versión nuevada?"
5. Usuario actualiza el enlace a la nueva versión


#### Caso 3: Búsqueda rápida en reunión

Usuario: Freelancer en presentación con cliente

Objetivo: Mostrar rápidamente un template previo similar

Acciones:
1. Cliente pregunta: "¿Tienes algo similar a esto?"
2. Profesional abre SmartMark en navegador
3. Busca "ecommerce template" (o filtra por carpeta, etc.)
4. Encuentra 3 templates similares con UI visuales claras
5. Abre uno en nueva pestaña para mostrar cliente



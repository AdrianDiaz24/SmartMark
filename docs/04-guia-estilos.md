# Guía de Estilos - SmartMark

## 1. Prototipo en Figma

Accede al prototipo interactivo y diseños de SmartMark en Figma:

**Enlace:** [Wireframe en Figma](https://www.figma.com/design/e5w0oBLLEJzgsiivFap7oR/SmartMark?node-id=4-6&t=LaNDSzvrmwkTRDxf-0)

En el prototipo encontrarás:
- Wireframes de todas las páginas
- Componentes
- Flujos de usuario
- Especificaciones de diseño

---

## 2. Paleta de Colores

### 2.1 Colores Primarios

| Color | Código Hex | Uso |
|-------|-----------|-----|
| Gris Oscuro Principal | `#2B2A2A` | Fondos de tarjetas, sidebars, modales |
| Gris Claro | `#E4E4E4` | Fondos de inputs, botones secundarios |
| Blanco | `#FFFFFF` | Texto principal, iconos |

### 2.2 Colores Secundarios

| Color | Código Hex | Uso |
|-------|-----------|-----|
| Naranja | `#FF9800` | URLs rotas, alertas visuales |
| Rojo | `#F44336` | Errores, eliminación |
| Verde | `#4CAF50` | Éxito, acciones completadas |
| Azul | `#0066CC` | Enlaces, elementos interactivos |

### 2.3 Colores de Tags

La aplicación web tiene diferentes colores que pueden ser asignados a un tag.

| Color       | Código Hex |
|-------------|------------|
| Rojo        | `#FF4343` |
| Verde       | `#51986C` |
| Azul        | `#593DF9` |
| Celeste     | `#33A4DC` |
| Amarillo    | `#FFE943` |
| Rosa        | `#F93DDD` |
| Turquesa    | `#33DCCB` |
| Gris Oscuro | `#616060` |

---

## 3. Tipografía

### 3.1 Fuentes del Sistema

**Familia tipográfica:** System Fonts

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
```

**Ventajas:**
- Carga instantánea
- Consistencia con el Sistema Operativo
- Sensación nativa

### 3.2 Escalas Tipográficas

| Elemento            | Tamaño |  Uso |
|---------------------|--------|------|
| Títulos Principales | 28px |  H1 en páginas |
| Títulos Secundarios | 20px |  H2, headers de secciones |
| Subtítulos          | 16px |  H3, subtítulos |
| Texto normal        | 14px | Texto de párrafos, descripciones |
| Texto pequeño       | 12px | Textos secundarios, etiquetas |
| Texto informativo   | 11px | Información adicional |

---

## 4. Espaciados

- Padding en tarjetas: `20px` 
- Gap entre elementos: `10px`, `15px`, `20px`, `30px`
- Margin en secciones: `20px` - `30px`

---

## 5. Wireframes de Pantallas Principales

### 5.1 HomePage

**Descripción:** Pantalla inicial con estadísticas y acceso rápido.

**Contenido:**
- Header con logo y botón crear marcador
- Sidebar con carpetas y tags
- Área principal con estadísticas
- Sección de marcadores recientes

![HomePage](https://i.gyazo.com/537879f6448197559c295e1c5e84d777.png)

### 5.2 BookmarksPage (/todos)

**Descripción:** Página principal de visualización y gestión de marcadores.

**Contenido:**
- Header con buscador
- Sidebar con carpetas jerárquicas y tags filtrables
- Grid/Lista de marcadores con
  - Portada (imagen)
  - Título
  - Descripción resumen
  - Tags (badges de color)
  - Indicador de URL rota (borde naranja)
  - Si es GitHub: estadísticas (stars, forks, lenguaje)
- Botón de crear marcador

**Visualización con Grid**

![BookMarkPageGrid](https://i.gyazo.com/18a3816c7a63e651ed977fc11447c812.png)

**Visualización en listado**

![BookMarkPageList](https://i.gyazo.com/e9c032cfd635605bfa08f779e487d685.png)

### 5.3 ManageFoldersPage

**Descripción:** Gestión centralizada de carpetas.

**Contenido:**
- Header con título "Gestiona tus carpetas"
- Sidebar izquierdo con lista de carpetas expandibles
- Centro con vista detallada de carpeta seleccionada:
  - Informacion de carpeta:
    - Nombre de carpeta
    - Carpeta padre
    - Tags
  - Informacion adicional:
    - Número de carpetas
    - Número de marcadores
    - Fecha de creación
- Panel de acciones rápidas
  - Editar
  - Ver contenido
  - Eliminar

![ManageFoldersPage](https://i.gyazo.com/d3b2e089e311f4160960b1456b11a98c.png)

### 5.4 ManageTagsPage

**Descripción:** Gestión centralizada de tags.

**Contenido:**
- Header con título "Gestiona tus tags"
- Sidebar izquierdo con lista de tags (badges)
- Centro con vista detallada de tag seleccionado:
  - Información del tag:
    - Nombre de tag 
    - Color
  - Información adicional:
    - Número de marcadores con este tag
    - Número de carpetas con este tag
    - Fecha de creación
- Panel de acciones rápidas
  - Actualizar
  - Ver contenido
  - Eliminar

![ManageTagsPage](https://i.gyazo.com/8c630c437bad1f4236393a2738c5ee66.png)

### 5.5 ManageBookmarksPage

**Descripción:** Gestión centralizada de marcadores.

**Contenido:**
- Header con título "Gestiona tus marcadores"
- Sidebar izquierdo con lista de marcadores (vista compacta)
- Centro con vista detallada de marcador seleccionado:
  - Portada - En caso de que no haya no sale
  - Título 
  - Descripción 
  - URL
  - Carpeta asignada
  - Tags asignados
- Panel de acciones rápidas:
  - Actualizar
  - Ver contenido
  - Eliminar

![ManageBookmarksPage](https://i.gyazo.com/bfdd349299f5cae9c48cc2c8cee3de4d.png)

### 5.6 Modal: CreateBookmarkModal

**Descripción:** Modal para crear nuevo marcador.

**Contenido:**
- Input: URL
- Preview automático de metadatos extraídos:
  - Título
  - Descripción
- Portada
- Selector de carpeta (dropdown)
- Multi-select de tags
- Botón de Guardar

![CreateBookmarkModal](https://i.gyazo.com/a9ad8936a3ef5ca0295ad9c92ad19ef8.png)

### 5.7 Modal: CreateFolderModal

**Descripción:** Modal para crear nueva carpeta.

**Contenido:**
- Input: Nombre de carpeta
- Selector de carpeta padre
- Botón de Crear

![CreateFolderModal](https://i.gyazo.com/fc70c354eacfaa4f57320d666b3f4eb7.png)

### 5.8 Modal: CreateTagModal

**Descripción:** Modal para crear nuevo tag.

**Contenido:**
- Input: Nombre del tag
- Selector clickable de color
- Botón de Crear

![CreateTagModal](https://i.gyazo.com/30bc471a68c3e69c97e0ed1785f52e4b.png)

---

## 6. Componentes Reutilizables Definidos

### 6.1 Componentes Principales

#### Header
**Ubicación:** `frontend/src/components/Header.js`
**Uso:** Barra superior global de la aplicación
**Props:**
- Contenido dinámico según contexto

#### Sidebar
**Ubicación:** `frontend/src/components/Sidebar.js`
**Uso:** Navegación principal con carpetas y tags
**Props:**
- Carpetas jerárquicas
- Tags filtrables

#### GridCard / LinkCard
**Ubicación:** `frontend/src/components/GridCard.js`, `LinkCard.js`
**Uso:** Visualización de marcadores
**Props:**
- Datos del marcador
- Estadísticas GitHub (si aplica)
- Estado de URL (válida/rota)
- Acciones (click para editar)

#### TagBadge
**Ubicación:** `frontend/src/components/TagBadge.js`
**Uso:** Mostrar tags con color personalizado
**Props:**
- Texto
- Color hexadecimal
- Clickeable
- Estado selected/unselected

#### FolderItem
**Ubicación:** `frontend/src/components/FolderItem.js`
**Uso:** Item de carpeta en listas jerárquicas
**Props:**
- Nombre de carpeta
- Icono
- Expandible

#### StatCard
**Ubicación:** `frontend/src/components/StatCard.js`
**Uso:** Cards de estadísticas (número de marcadores, carpetas, tags)
**Props:**
- Icono
- Título
- Valor numérico

### 6.2 Componentes de Modal

#### CreateBookmarkModal
**Ubicación:** `frontend/src/components/CreateBookmarkModal.js`
**Uso:** Crear nuevo marcador
**Props:**
- onClose
- onCreateBookmark

#### CreateFolderModal
**Ubicación:** `frontend/src/components/CreateFolderModal.js`
**Uso:** Crear nueva carpeta
**Props:**
- onClose
- onCreateFolder

#### CreateTagModal
**Ubicación:** `frontend/src/components/CreateTagModal.js`
**Uso:** Crear nuevo tag
**Props:**
- onClose
- onCreateTag

#### DeleteBookmarkModal
**Ubicación:** `frontend/src/components/DeleteBookmarkModal.js`
**Uso:** Confirmación de eliminación de marcador
**Props:**
- isOpen
- onClose
- onConfirmDelete

#### DeleteFolderModal
**Ubicación:** `frontend/src/components/DeleteFolderModal.js`
**Uso:** Confirmación de eliminación de carpeta
**Props:**
- isOpen
- onClose
- onConfirmDelete

#### DeleteTagModal
**Ubicación:** `frontend/src/components/DeleteTagModal.js`
**Uso:** Confirmación de eliminación de tag
**Props:**
- isOpen
- onClose
- onConfirmDelete

### 6.3 Componentes de Contenido

#### FilterBar
**Ubicación:** `frontend/src/components/FilterBar.js`
**Uso:** Buscador de texto en tiempo real
**Props:**
- onSearch
- placeholder

#### Toast / Notificaciones
**Ubicación:** `frontend/src/components/Toast.js`
**Uso:** Mensajes de éxito, error, información
**Props:**
- Mensaje
- Tipo (success/error/info)
- Duración

#### QuickActionsPanel
**Ubicación:** `frontend/src/components/QuickActionsPanel.js`
**Uso:** Botones de acciones rápidas (Ver, Actualizar, Eliminar)
**Props:**
- viewButtonText
- onUpdate
- onView
- onDelete

### 6.4 Componentes de Gestión

#### ManageSidebarFolder
**Ubicación:** `frontend/src/components/ManageSidebarFolder.js`
**Uso:** Sidebar en página de gestión de carpetas
**Props:**
- Listado de carpetas
- Selección activa
- Callbacks de acciones

#### ManageSidebarTag
**Ubicación:** `frontend/src/components/ManageSidebarTag.js`
**Uso:** Sidebar en página de gestión de tags
**Props:**
- Listado de tags
- Selección activa
- Callbacks de acciones

#### ManageTagCenter
**Ubicación:** `frontend/src/components/ManageTagCenter.js`
**Uso:** Área central para editar tag
**Props:**
- Datos del tag
- onChange para cambios

#### ManageFolderCenter
**Ubicación:** `frontend/src/components/ManageFolderCenter.js`
**Uso:** Área central para editar carpeta
**Props:**
- Datos de carpeta
- onChange para cambios

#### ManageBookmark
**Ubicación:** `frontend/src/components/ManageBookmark.js`
**Uso:** Área central para editar marcador
**Props:**
- Datos del marcador
- onChange para cambios

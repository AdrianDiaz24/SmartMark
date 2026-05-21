# Desarrollo - SmartMark

## 1. Secuencia de Desarrollo Seguida

### Fase 1: Diseño y Arquitectura (Semana 1-2)
1. Análisis de requisitos y definición de MVP
2. Diseño de base de datos relacional (SQLite)
3. Creación de wireframes en Figma
4. Definición de API REST endpoints

### Fase 2: Frontend (React) (Semana 3-4)
1. Configuración inicial de Create React App
2. Definición de estructura de componentes
3. Implementación de páginas principales (HomePage, BookmarksPage, ManagePages)
6. Modales para crear/editar/eliminar

### Fase 3: Backend (Node.js + Express) (Semana 5-6)
1. Configuración inicial de Express.js
2. Implementación de conexión SQLite
3. Desarrollo de controllers para CRUD (Marcadores, Categorías, Tags)
4. Implementación de middleware (CORS, manejo de errores)
5. Sistema de scraping de URLs (extracción de metadatos)
6. Integración con GitHub API
7. Cron job para verificación automática de URLs (cada 7 días)
8. Tests manuales con Postman/curl

### Fase 3: Conectar backend con frontend (React) (Semana 7-8)
1. Conectar frontend con backend usando Axios
2. Implementar rutas API en servicios React
3. Implementar lógica de filtrado y búsqueda en frontend
4. Sistema de Context API para gestión de estado.
5. Implementar web scraping en backend y mostrar datos en el frontend
6. crear sistema de auto-etiquetado basado en contenido extraído y tag existente en la BD

### Fase 4: Correcciones y terminar de añadir propuestas de valor (Semana 8-9)
1. Correcciones de bugs
2. Fallos nuevos en el frontend (sidebar tags en columna, icono "+" no centrado, etc.)
3. Implementar las llamadas a la API de GitHub para mostrar estadísticas en tarjetas
4. Añadir Cron Job para verificación automática de URLs cada 7 días
5. Pruebas manuales de la aplicacion web completa (frontend + backend)


### Fase 5: Dokerizar (Docker + Docker Compose) (Semana 10)
1. Creación de Dockerfile para backend
2. Creación de Dockerfile para frontend
3. Configuración de docker-compose.yml
4. Implementación de GitHub Actions workflow para CD
5. Push automático a Docker Hub
6. Intento de implementacion de CI
7. Crear documentación

---

## 2. Dificultades Encontradas y Cómo se Superaron

### Dificultad 1: Web Scraping (Desconocimiento Inicial)

**Problema:**
No tenía experiencia previa en web scraping. Las URLs necesitaban extraer automáticamente título y descripción sin intervención del usuario.

**Causa raíz:**
- Tema nunca tocado en clase
- Múltiples formas de extraer datos (meta tags, estructuras HTML variables, APIs)
- Decisión entre librerías (cheerio, jsdom, puppeteer)

**Solución:**
1. Ver videos tutoriales de web scraping con Node.js
2. Estudiar estructura HTML y meta tags (og:title, og:description, og:image)
3. Implementar solución con cheerio (más ligero que puppeteer)
4. Consultar con IA cuando encontraba formatos inesperados
5. Agregar try-catch para manejar URLs que no tienen metadatos estándar

```javascript
// Solución final implementada
async function scrapeUrl(url) {
    try {
        const response = await axios.get(url, {
            timeout: 5000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const cheerio = require('cheerio');
        const $ = cheerio.load(response.data);

        // Intentar múltiples fuentes de datos
        const title = $('meta[property="og:title"]').attr('content') || 
                     $('meta[name="title"]').attr('content') ||
                     $('title').text();
        
        const description = $('meta[property="og:description"]').attr('content') || 
                           $('meta[name="description"]').attr('content');
        
        const image = $('meta[property="og:image"]').attr('content');

        return { success: true, titulo: title, descripcion: description, portada: image };
    } catch (error) {
        console.error('Error scraping:', error.message);
        return { success: false };
    }
}
```

**Lección aprendida:** El web scraping requiere flexibilidad para manejar diferentes estructuras HTML. Las consultas a IA fueron cruciales para resolver algunos casos.

---

### Dificultad 2: Conversión de PNG a SVG (Imposible de Resolver)

**Problema:**
Los iconos en PNG no se podían convertir a SVG de calidad. La aplicación necesitaba iconos vectoriales para mejor escalabilidad y rendimiento.

**Causa raíz:**
- Convertidores online generaban SVGs con errores haciendo que no se renderizaran correctamente o renderizara simplemente un cuadrado
- Redimensionamiento de imágenes PNG causaba pérdida de calidad
- Dibujadores profesionales de SVG requerían habilidades manuales (diseño gráfico)
- Librerías como `potrace` tenían resultados inconsistentes

**Intentos realizados:**
1. Convertidores online: Convertio, CloudConvert, Zamzar → Resultados pobres
2. Potrace (librería): Conversión muy lenta y calidad variable
3. Dibujo manual en Figma: Muy lento para múltiples iconos
4. Buscar iconos SVG existentes: Muchos no coincidían con el diseño

**Solución implementada (parcial):**
- Dejar iconos PNG por ahora (funcionan bien en web)
- Preparar nota para futuro: "Rediseñar iconos como SVG nativos"
- Algunos componentes usan HTML puro (botones +, ×) en lugar de imágenes

**Decisión:** Priorizar funcionalidad sobre perfeccionismo. Los PNG funcionan correctamente.
**Roadmap:** Rediseñar todos los iconos como SVG en futuras iteraciones.

---

### Dificultad 3: Gestión del Tiempo

**Problema:**
El proyecto terminó "muy justo" en documentación y finales de sprint. No todas las tareas se completaron dentro del cronograma planificado.

**Causa raíz:**
- Subestime complejidad de ciertas tareas (web scraping, Docker, verificación de URLs)
- Debugging de problemas inesperados consumió más tiempo: Node.js 18, React build args, comunicación frontend-backend

**Impacto en el proyecto:**
- MVP completado 100%
- CI en GitHub Actions: Comenzado pero no finalizado (solo CD funcional)
- Documentación: Terminada en último momento
- Tests: Solo manuales, sin tests automatizados

**Lecciones:**
1. Agregar un 20-30% mas de tiempo en estimaciones
2. No perfectionar features sino alcanzar MVP
4. Comprobar diariamente el progreso vs cronograma

---

### Dificultad 4: Fallo en Implementación de CI (GitHub Actions - Continuous Integration)

**Problema:**
Se planeó implementar CI (validación automática de código, tests) en GitHub Actions, pero no se completó dentro del cronograma.

**Causa raíz:**
- Se priorizó CD (Continuous Deployment) sobre CI
- Tests unitarios nunca se implementaron (todo era manual)
- Debugging de CI es más lento que desarrollo local

**Estado actual:**
```
GitHub Actions Workflow: Implementado
- Build Docker images
-  Push a Docker Hub
-  Tagging (latest + commit SHA)

Falta:
- Test Unitarios
- Creacion de un workflow de CI que ejecute los tests unitarios
- Hacer que genere documentación automática del código y se publique en GitHub Pages
```

**Configuración parcial que existe:**
```yaml
# .github/workflows/docker-build-push.yml (funciona)
name: Build and Push Docker Images
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build and push Backend
        uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
```

**¿Por qué no se implementó CI?**
1. CD fue suficiente para validar que imágenes se crean correctamente
2. Tests manuales en navegador eran más efectivos para UI
3. Tiempo limitado: MVP completado vs CI adicional
4. Sin tests unitarios, no hay qué validar automáticamente

**Plan para futuro:**
```
Fase 1: Tests unitarios (backend)
Fase 2: Tests de integración
Fase 3: GitHub Actions CI con validaciones
Fase 4: Documentación automática en GitHub Pages
```

**Decisión tomada:** Avanzar en el desarrollo del MVP y CD, dejando CI para iteraciones futuras.

---

## 3. Decisiones Técnicas Clave y Justificación

### Decisión 1: SQLite en lugar de PostgreSQL/MongoDB

| Aspecto | SQLite | PostgreSQL | MongoDB |
|--------|--------|-----------|---------|
| Instalación | Archivo único | Servidor | Servidor |
| Complejidad | Mínima | Media | Media |
| Escalabilidad | Limitada | Alta | Alta |
| Uso | Local/single-user | Multi-usuario/empresas | NoSQL |
| **Justificación para SmartMark** | MVP de usuario único, fácil deploy local | Overkill inicial | Datos muy relacionales |

**Conclusión:** SQLite es ideal para MVP personal que puede evolucionar a PostgreSQL después.

---

### Decisión 2: React para Frontend

**Alternativas contempladas:** Angular

**Razones de elección:**
- Mayor comunidad y recursos
- Componentes reutilizables naturalmente
- Context API suficiente para estado simple
- Hooks que facilitan el desarrollo

---

### Decisión 3: Node.js para Backend

**Razones de elección:**
- Ecosistema npm amplio
- Mismo lenguaje que frontend (JavaScript)
- Middleware modular para manejo de CORS, errores, etc.
- Perfect para API REST simple

---

### Decisión 4: Docker Compose

**Justificación:**
- MVP no requiere orquestación compleja
- Composición simple de 2 servicios
- Fácil de entender y desplegar

---

### Decisión 5: Cron Job en Backend para Verificación de URLs

**Alternativa:** Task scheduler externo (AWS Lambda)

**Justificación:**
- Self-hosted sin dependencias externas
- Funciona en cualquier servidor
- Cálculo simple (¿pasaron 7 días?)
- Sin costos adicionales
- Logs almacenados localmente

```javascript
// backend/src/config/cronJobConfig.js
const VERIFICATION_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 días

async function checkAndVerifyIfNeeded() {
    const lastLog = await db.get('SELECT last_verification FROM verification_log ORDER BY last_verification DESC LIMIT 1');
    const now = Date.now();
    
    if (!lastLog || now - new Date(lastLog.last_verification).getTime() > VERIFICATION_INTERVAL) {
        // Ejecutar verificación
        await verifyAllUrls();
    }
}
```

---

## 4. Herramientas de Control de Versiones Utilizadas

### Git Flow Implementado

```
main (estable)
    ↑
    └─── commits directos en desarrollo inicial
    ├─── GitHub Actions (CI/CD)
    └─── Deploy automático a Docker Hub
```

Ahora que se encuentra desplegado, los futuros commits se harán en ramas de desarrollo (`features/implementacion`) y luego se hara el Merge a `main` para producción, en el caso de los fixes se haran en (`fix/correccion`).

### Comandos Git Comúnmente Usados

```bash
# Clonar inicial
git clone https://github.com/AdrianDiaz24/SmartMark.git

# Desarrollo
git add .
git commit -m "Descripción del cambio"
git push origin main

# Para nuevas funcionalidades a partir de ahora
git checkout -b feature/nueva-funcionalidad

# Unir a main
git checkout main
git merge feature/nueva-funcionalidad
git push origin main

```

### GitHub Workflows

**Archivo:** `.github/workflows/docker-build-push.yml`
- Trigger: `on: push to main`
- Acciones: Build → Login Docker Hub → Push images → Tag (latest + commit SHA)

---

## 5. Fragmentos de Código Relevantes

### 5.1 Extracción de Metadatos (Scraping)

**Ubicación:** `backend/src/controllers/scrapingController.js`

**Explicación:** Extrae automáticamente título, descripción e imagen de una URL usando web scraping

```javascript
async function scrapeUrl(url) {
    try {
        const urlObj = new URL(url);
        
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            maxRedirects: 5
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Extraer título (intentar múltiples fuentes)
        let titulo = $('meta[property="og:title"]').attr('content') || '';
        if (!titulo) titulo = $('title').text() || '';
        if (!titulo) titulo = $('meta[name="title"]').attr('content') || '';

        // Extraer descripción
        let descripcion = $('meta[property="og:description"]').attr('content') || '';
        if (!descripcion) descripcion = $('meta[name="description"]').attr('content') || '';

        // Extraer imagen
        let imagen = $('meta[property="og:image"]').attr('content') || '';

        return {
            success: true,
            titulo: titulo.trim().substring(0, 200) || 'Sin título',
            descripcion: descripcion.trim().substring(0, 500) || '',
            imagen: imagen || null
        };
    } catch (error) {
        console.error('Error al hacer scraping:', error.message);
        return { success: false, error: error.message };
    }
}
```

---

### 5.2 Verificación de URLs (Cron Job)

**Ubicación:** `backend/src/services/urlVerificationService.js`

**Explicación:** Verifica cada URL grabada con HEAD/GET requests y registra estado

```javascript
async function verifyAllBookmarks(db) {
    try {
        console.log('Iniciando verificación semanal de URLs...');
        
        const bookmarks = await db.all(`SELECT id, url FROM Marcadores`);
        console.log(`Verificando ${bookmarks.length} marcadores...`);

        let contador = 0;
        for (let bookmark of bookmarks) {
            try {
                const estado = await verifyUrl(bookmark.url);
                
                // Actualizar el estado en la BD
                await db.run(`
                    UPDATE Marcadores 
                    SET url_estado = ?, ultima_verificacion = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [estado, bookmark.id]);

                contador++;
                
                if (contador % 10 === 0) {
                    console.log(`Verificados ${contador} de ${bookmarks.length} marcadores...`);
                }
            } catch (error) {
                console.error(`Error verificando marcador ${bookmark.id}:`, error.message);
            }
        }

        console.log(`Verificación completada. ${contador} marcadores procesados.`);
        return { verificados: contador, total: bookmarks.length };
    } catch (error) {
        console.error('Error en verificación de URLs:', error.message);
        throw error;
    }
}
```

---

### 5.3 Componente React con Filtros

**Ubicación:** `frontend/src/pages/BookmarksPage.js`

**Explicación:** Página principal que consume API y usa filtros de carpeta, tags y búsqueda

```javascript
function BookmarksPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [bookmarks, setBookmarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');

    const activeFolder = searchParams.get('carpeta');
    const activeTag = searchParams.get('tag');
    const searchTerm = searchParams.get('search');

    // Cargar marcadores cuando cambien los filtros
    useEffect(() => {
        loadBookmarks();
    }, [activeFolder, activeTag, searchTerm]);

    const loadBookmarks = async () => {
        try {
            setLoading(true);
            let query = '/api/links';
            
            if (activeFolder) query += `?carpeta=${activeFolder}`;
            if (activeTag) query += `${activeFolder ? '&' : '?'}tag=${activeTag}`;
            if (searchTerm) query += `${activeFolder || activeTag ? '&' : '?'}search=${searchTerm}`;

            const data = await bookmarksService.getAll(query);
            setBookmarks(data);
        } catch (error) {
            console.error('Error cargando marcadores:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bookmarks-container">
            <Sidebar />
            <div className="bookmarks-main">
                <FilterBar placeholder="Buscar marcadores..." />
                <div className={viewMode === 'grid' ? 'bookmarks-grid' : 'bookmarks-list'}>
                    {bookmarks.map(bookmark => (
                        viewMode === 'grid' 
                            ? <GridCard key={bookmark.id} data={bookmark} />
                            : <LinkCard key={bookmark.id} data={bookmark} />
                    ))}
                </div>
            </div>
        </div>
    );
}
```

---

### 5.4 Auto-Etiquetado de Tags

**Ubicación:** `backend/src/controllers/scrapingController.js`

**Explicación:** Detecta tecnologías en contenido extraído y asigna tags automáticamente

```javascript
async function autotagBookmark(db, titulo, descripcion, url = '') {
    try {
        // Obtener todos los tags disponibles
        const allTags = await db.all('SELECT id, nombre FROM Tags');
        
        if (!allTags || allTags.length === 0) {
            console.log('[Autotagging] No hay tags disponibles en la base de datos');
            return [];
        }

        const tagsEncontrados = new Set();
        
        // Buscar en título
        const tagsEnTitulo = findMatchingTagsInText(titulo, allTags);
        tagsEnTitulo.forEach(id => tagsEncontrados.add(id));
        
        // Buscar en descripción
        const tagsEnDescripcion = findMatchingTagsInText(descripcion, allTags);
        tagsEnDescripcion.forEach(id => tagsEncontrados.add(id));
        
        // Buscar en dominio de la URL
        const dominio = extractDomainFromUrl(url);
        if (dominio) {
            const tagsEnUrl = findMatchingTagsInText(dominio, allTags);
            tagsEnUrl.forEach(id => tagsEncontrados.add(id));
        }

        console.log(`[Autotagging] Total de tags encontrados: ${tagsEncontrados.size}`);
        return Array.from(tagsEncontrados);
    } catch (error) {
        console.error('Error en autotagging:', error.message);
        return [];
    }
}
```





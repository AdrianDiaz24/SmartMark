/**
 * @fileoverview Rutas para gestionar Marcadores (Bookmarks) - CRUD, scraping, búsqueda
 * @module routes/bookmarks
 */

const express = require('express');
const router = express.Router();
const {
    getBookmarks,
    getBookmarkById,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    addTagsToBookmark,
    removeTagFromBookmark,
    getBookmarksByTag,
    recordBookmarkAccess,
    getRecentBookmarks,
    getBookmarksVisitedLastWeek,
    countAllBookmarks,
    countBookmarksVisitedLastWeek
} = require('../controllers/bookmarksController');
const {
    scrapeUrl,
    autotagBookmark,
    getGitHubRepoData,
    getGitHubLanguages
} = require('../controllers/scrapingController');

let db;
let upload;

// Middleware para inyectar la conexión a la BD y multer
router.use((req, res, next) => {
    db = req.db;
    upload = req.app.locals.upload;
    next();
});

// POST /api/links/scrape - Hacer web scraping de una URL
router.post('/scrape', async (req, res, next) => {
    try {
        const { url } = req.body;

        if (!url || !url.trim()) {
            return res.status(400).json({ error: 'URL es requerida' });
        }

        const scrapedData = await scrapeUrl(url);
        const usuarioId = req.usuario.id; // Obtener ID del usuario autenticado
        
        // Si el scraping fue exitoso, hacer autotagging
        if (scrapedData.success) {
            // 1. Autotagging básico (título, descripción, dominio) - solo para tags del usuario
            let autoTags = await autotagBookmark(db, scrapedData.titulo, scrapedData.descripcion, url, usuarioId);
            
            // 2. Si es GitHub, obtener datos del repositorio
            let gitHubData = null;
            if (url.includes('github.com')) {
                gitHubData = await getGitHubRepoData(url);
                const gitHubLanguages = await getGitHubLanguages(url);
                
                if (gitHubData) {
                    scrapedData.gitHubData = gitHubData;
                    scrapedData.gitHubLanguages = gitHubLanguages;
                    
                    // Agregar lenguajes de GitHub al autotagging - solo para tags del usuario
                    for (let language of gitHubLanguages) {
                        // Buscar si existe un tag para este lenguaje EN LOS TAGS DEL USUARIO
                        const tagForLanguage = await db.get(
                            'SELECT id FROM Tags WHERE LOWER(nombre) = LOWER(?) AND usuario_id = ?',
                            [language, usuarioId]
                        );
                        if (tagForLanguage) {
                            autoTags.push(tagForLanguage.id);
                            console.log(`[GitHub Autotagging] Añadido tag: ${language} (ID: ${tagForLanguage.id})`);
                        }
                    }
                    
                    // Eliminar duplicados
                    autoTags = [...new Set(autoTags)];
                }
            }
            
            scrapedData.autoTags = autoTags; // Retornar IDs de tags encontrados
        }

        res.json(scrapedData);
    } catch (error) {
        console.error('Error en POST /scrape:', error);
        next(error);
    }
});

// GET /api/links/stats/recent - Obtener los últimos 10 marcadores más recientemente abiertos
router.get('/stats/recent', async (req, res, next) => {
    try {
        const usuarioId = req.usuario.id;
        const bookmarks = await getRecentBookmarks(db, usuarioId);
        res.json(bookmarks);
    } catch (error) {
        next(error);
    }
});

// GET /api/links - Obtener marcadores (con filtros opcionales)
/**
 * GET /api/links
 * @summary Obtiene marcadores del usuario autenticado con filtros
 * @tags Bookmarks
 * @security Bearer
 * @queryParam {number} categoria_id - ID de carpeta para filtrar (opcional)
 * @queryParam {number} tag_id - ID de tag para filtrar (opcional)
 * @queryParam {string} search - Término de búsqueda en títulos/descripciones (opcional)
 * @queryParam {boolean} all - Si es true, busca en todas las carpetas, si false solo en sección general (default: false)
 * @queryParam {number} limit - Número máximo de resultados (default: sin límite)
 * @queryParam {number} offset - Número de resultados a saltar para paginación (default: 0)
 * @returns {array} 200 - Array de marcadores con todos sus datos
 * @returns {object} 401 - No autenticado
 * @returns {object} 500 - Error interno del servidor
 */
router.get('/', async (req, res, next) => {
    try {
        const { categoria_id, tag_id, search, limit, offset, all } = req.query;
        const usuarioId = req.usuario.id;

        const bookmarks = await getBookmarks(db, usuarioId, {
            categoria_id: categoria_id ? parseInt(categoria_id) : null,
            tag_id: tag_id ? parseInt(tag_id) : null,
            search,
            all: all === 'true', // Convertir string 'true' a booleano
            limit: limit ? parseInt(limit) : null,
            offset: offset ? parseInt(offset) : null
        });

        res.json(bookmarks);
    } catch (error) {
        next(error);
    }
});

// GET /api/links/stats/last-week - Obtener marcadores visitados última semana
router.get('/stats/last-week', async (req, res, next) => {
    try {
        const usuarioId = req.usuario.id;
        const bookmarks = await getBookmarksVisitedLastWeek(db, usuarioId);
        res.json(bookmarks);
    } catch (error) {
        next(error);
    }
});

// GET /api/links/stats/count-last-week - Contar marcadores visitados última semana
router.get('/stats/count-last-week', async (req, res, next) => {
    try {
        const usuarioId = req.usuario.id;
        const count = await countBookmarksVisitedLastWeek(db, usuarioId);
        res.json({ count });
    } catch (error) {
        next(error);
    }
});

// GET /api/links/stats/count-all - Contar todos los marcadores del usuario
router.get('/stats/count-all', async (req, res, next) => {
    try {
        const usuarioId = req.usuario.id;
        const count = await countAllBookmarks(db, usuarioId);
        res.json({ count });
    } catch (error) {
        next(error);
    }
});

// POST /api/links/refresh-github - Actualizar datos de GitHub de todos los marcadores
router.post('/refresh-github', async (req, res, next) => {
    try {
        console.log('[GitHub Refresh] Iniciando actualización de datos de GitHub');
        
        // Obtener todos los marcadores
        const allBookmarks = await db.all(`
            SELECT id, url, titulo FROM Marcadores WHERE url LIKE '%github.com%'
        `);

        console.log(`[GitHub Refresh] Encontrados ${allBookmarks.length} marcadores de GitHub`);

        let updated = 0;
        let failed = 0;
        const results = [];

        // Actualizar datos de GitHub para cada marcador
        for (let bookmark of allBookmarks) {
            try {
                console.log(`[GitHub Refresh] Actualizando: ${bookmark.titulo}`);
                
                const gitHubData = await getGitHubRepoData(bookmark.url);
                const gitHubLanguages = await getGitHubLanguages(bookmark.url);

                if (gitHubData) {
                    await db.run(`
                        UPDATE Marcadores 
                        SET github_stars = ?, github_forks = ?, github_watchers = ?, github_languages = ?
                        WHERE id = ?
                    `, [
                        gitHubData.stars || 0,
                        gitHubData.forks || 0,
                        gitHubData.watchers || 0,
                        gitHubLanguages && gitHubLanguages.length > 0 ? JSON.stringify(gitHubLanguages) : null,
                        bookmark.id
                    ]);

                    updated++;
                    results.push({
                        id: bookmark.id,
                        titulo: bookmark.titulo,
                        status: 'success',
                        data: gitHubData
                    });

                    console.log(`[GitHub Refresh] ✓ Actualizado: ${bookmark.titulo} (Starts: ${gitHubData.stars}, Forks: ${gitHubData.forks})`);
                } else {
                    failed++;
                    results.push({
                        id: bookmark.id,
                        titulo: bookmark.titulo,
                        status: 'failed',
                        error: 'No se pudieron obtener datos de GitHub'
                    });
                }
            } catch (error) {
                failed++;
                console.error(`[GitHub Refresh] Error actualizando ${bookmark.titulo}:`, error.message);
                results.push({
                    id: bookmark.id,
                    titulo: bookmark.titulo,
                    status: 'error',
                    error: error.message
                });
            }
        }

        console.log(`[GitHub Refresh] Completado: ${updated} actualizados, ${failed} fallidos`);

        res.json({
            success: true,
            total: allBookmarks.length,
            updated,
            failed,
            results
        });
    } catch (error) {
        console.error('Error en POST /refresh-github:', error);
        next(error);
    }
});

// GET /api/links/:id - Obtener un marcador específico
/**
 * GET /api/links/{id}
 * @summary Obtiene un marcador específico por ID
 * @tags Bookmarks
 * @security Bearer
 * @pathParam {number} id - ID del marcador (requerido)
 * @returns {object} 200 - Marcador encontrado
 * @returns {object} 401 - No autenticado
 * @returns {object} 404 - Marcador no encontrado
 * @returns {object} 500 - Error interno del servidor
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;
        const bookmark = await getBookmarkById(db, usuarioId, id);

        if (!bookmark) {
            return res.status(404).json({ error: 'Marcador no encontrado' });
        }

        res.json(bookmark);
    } catch (error) {
        next(error);
    }
});

// POST /api/links - Crear un nuevo marcador
/**
 * POST /api/links
 * @summary Crea un nuevo marcador
 * @tags Bookmarks
 * @security Bearer
 * @requestBody {object} required - Datos del nuevo marcador
 * @requestBody.titulo {string} - Título del marcador (requerido)
 * @requestBody.url {string} - URL del sitio web (requerido)
 * @requestBody.descripcion {string} - Descripción (opcional)
 * @requestBody.categoria_id {number} - ID de carpeta (opcional, default: sección general)
 * @requestBody.tags {array} - Array de IDs de tags (opcional)
 * @requestBody.portada {file} - Imagen de portada .png/.jpg/.svg (opcional)
 * @requestBody.github_stars {number} - Stars de GitHub (opcional, solo para repos)
 * @requestBody.github_forks {number} - Forks de GitHub (opcional, solo para repos)
 * @requestBody.github_languages {array} - Lenguajes de GitHub (opcional, solo para repos)
 * @returns {object} 201 - Marcador creado exitosamente
 * @returns {object} 400 - Título o URL faltantes
 * @returns {object} 401 - No autenticado
 * @returns {object} 500 - Error interno del servidor
 */
router.post('/', async (req, res, next) => {
    try {
        // Obtener upload del middleware
        const uploadSingle = upload.single('portada');
        
        uploadSingle(req, res, async (err) => {
            if (err) {
                return next(err);
            }

            try {
                // Extraer campos del body o del query/form fields
                let { titulo, url, descripcion, categoria_id, tags, github_stars = 0, github_forks = 0, github_watchers = 0, github_languages = [] } = req.body;

                if (!titulo || !url) {
                    return res.status(400).json({ error: 'El título y URL son requeridos' });
                }

                // Si se subió un archivo, convertir a base64
                let portada = null;
                if (req.file) {
                    // Convertir el buffer a base64
                    portada = req.file.buffer.toString('base64');
                    console.log(`Archivo recibido: ${req.file.originalname}, tamaño: ${req.file.size} bytes`);
                }

                // Parsear tags - pueden venir como JSON string
                let parsedTags = [];
                if (tags) {
                    try {
                        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
                    } catch (e) {
                        parsedTags = [];
                    }
                }

                // Parsear github_languages - pueden venir como JSON string
                let parsedGithubLanguages = [];
                if (github_languages) {
                    try {
                        parsedGithubLanguages = typeof github_languages === 'string' ? JSON.parse(github_languages) : github_languages;
                    } catch (e) {
                        parsedGithubLanguages = [];
                    }
                }
                
                const parsedCategoryId = categoria_id ? parseInt(categoria_id) : null;

                console.log('Creando bookmark:', { titulo, url, descripcion, parsedCategoryId, parsedTags, tienePortada: !!portada, github_stars, github_forks });

                const usuarioId = req.usuario.id;
                const newBookmark = await createBookmark(db, usuarioId, {
                    titulo,
                    url,
                    descripcion,
                    portada,
                    categoria_id: parsedCategoryId,
                    tags: parsedTags || [],
                    github_stars: parseInt(github_stars) || 0,
                    github_forks: parseInt(github_forks) || 0,
                    github_watchers: parseInt(github_watchers) || 0,
                    github_languages: parsedGithubLanguages || []
                });

                res.status(201).json(newBookmark);
            } catch (error) {
                console.error('Error en POST /links:', error);
                next(error);
            }
        });
    } catch (error) {
        console.error('Error en POST /links (outer):', error);
        next(error);
    }
});

// PUT /api/links/:id - Actualizar un marcador
/**
 * PUT /api/links/{id}
 * @summary Actualiza un marcador existente
 * @tags Bookmarks
 * @security Bearer
 * @pathParam {number} id - ID del marcador (requerido)
 * @requestBody {object} required - Datos a actualizar
 * @requestBody.titulo {string} - Título del marcador (opcional)
 * @requestBody.url {string} - URL del sitio web (opcional)
 * @requestBody.descripcion {string} - Descripción (opcional)
 * @requestBody.categoria_id {number} - ID de carpeta (opcional)
 * @requestBody.tags {array} - Array de IDs de tags (opcional)
 * @requestBody.portada {file} - Imagen de portada .png/.jpg/.svg (opcional)
 * @returns {object} 200 - Marcador actualizado exitosamente
 * @returns {object} 401 - No autenticado
 * @returns {object} 404 - Marcador no encontrado
 * @returns {object} 500 - Error interno del servidor
 */
router.put('/:id', async (req, res, next) => {
    try {
        // Obtener upload del middleware
        const uploadSingle = upload.single('portada');
        
        uploadSingle(req, res, async (err) => {
            if (err) {
                return next(err);
            }

            try {
                const { id } = req.params;
                let { titulo, url, descripcion, categoria_id, tags, portada: bodyPortada } = req.body;

                // Si se subió un archivo, convertir a base64
                let portada = undefined;
                if (req.file) {
                    // Convertir el buffer a base64
                    portada = req.file.buffer.toString('base64');
                    console.log(`Archivo recibido para actualización: ${req.file.originalname}, tamaño: ${req.file.size} bytes`);
                } else if (bodyPortada === '') {
                    // Si la portada es una string vacía, significa que queremos eliminarla
                    portada = null;
                    console.log('Eliminando portada del bookmark');
                }

                // Parsear tags - pueden venir como JSON string
                let parsedTags = undefined;
                if (tags) {
                    try {
                        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : tags;
                    } catch (e) {
                        parsedTags = undefined;
                    }
                }
                
                // Parsear categoria_id - puede ser: número > 0, string vacía (sección general), o undefined (no cambiar)
                let parsedCategoryId = undefined;
                if (categoria_id !== undefined && categoria_id !== null) {
                    if (categoria_id === '' || categoria_id === '0' || categoria_id === 0) {
                        // String vacía = sección general (null)
                        parsedCategoryId = null;
                    } else {
                        // Convertir a número
                        const intId = parseInt(categoria_id);
                        if (!isNaN(intId)) {
                            parsedCategoryId = intId;
                        }
                    }
                }

                const updatedBookmark = await updateBookmark(db, id, {
                    titulo,
                    url,
                    descripcion,
                    portada,
                    categoria_id: parsedCategoryId,
                    tags: parsedTags
                });

                res.json(updatedBookmark);
            } catch (error) {
                console.error('Error en PUT /links/:id:', error);
                next(error);
            }
        });
    } catch (error) {
        console.error('Error en PUT /links/:id (outer):', error);
        next(error);
    }
});

// DELETE /api/links/:id - Eliminar un marcador
/**
 * DELETE /api/links/{id}
 * @summary Elimina un marcador
 * @tags Bookmarks
 * @security Bearer
 * @pathParam {number} id - ID del marcador (requerido)
 * @returns {object} 200 - Marcador eliminado exitosamente
 * @returns {object} 401 - No autenticado
 * @returns {object} 404 - Marcador no encontrado
 * @returns {object} 500 - Error interno del servidor
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await deleteBookmark(db, id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// POST /api/links/:id/tags - Agregar tags a un marcador
router.post('/:id/tags', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { tag_ids } = req.body;

        if (!tag_ids || !Array.isArray(tag_ids)) {
            return res.status(400).json({ error: 'tag_ids debe ser un array' });
        }

        const tags = await addTagsToBookmark(db, id, tag_ids);
        res.json(tags);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/links/:id/tags/:tag_id - Remover un tag de un marcador
router.delete('/:id/tags/:tag_id', async (req, res, next) => {
    try {
        const { id, tag_id } = req.params;
        const result = await removeTagFromBookmark(db, id, tag_id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// POST /api/links/:id/access - Registrar que se abrió el marcador
router.post('/:id/access', async (req, res, next) => {
    try {
        const { id } = req.params;
        const bookmark = await recordBookmarkAccess(db, id);
        res.json(bookmark);
    } catch (error) {
        next(error);
    }
});


module.exports = router;


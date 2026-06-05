/**
 * @fileoverview Rutas para gestionar Marcadores (Bookmarks) - CRUD, scraping, búsqueda
 * @module routes/bookmarks
 */

const express = require('express');
const router = express.Router();
const bookmarkService = require('../services/bookmarkService');

let db;
let upload;

// Middleware para inyectar la conexión a la BD y multer
router.use((req, res, next) => {
    db = req.db;
    upload = req.app.locals.upload;
    next();
});

// POST /api/links/scrape - Hacer web scraping de una URL
/**
 * POST /api/links/scrape
 * @summary Realiza web scraping automático de una URL
 * @tags Bookmarks
 * @security Bearer
 * @requestBody {object} required
 * @requestBody.url {string} - URL para hacer scraping
 * @returns {object} 200 - Datos scrapeados con tags automáticos
 * @returns {object} 400 - URL requerida
 * @returns {object} 401 - No autenticado
 * @returns {object} 500 - Error en scraping
 */
router.post('/scrape', async (req, res, next) => {
    try {
        const { url } = req.body;
        if (!url || !url.trim()) {
            return res.status(400).json({ error: 'URL es requerida' });
        }

        const usuarioId = req.usuario.id;
        const scrapedData = await bookmarkService.scrapeAndAutoTag(db, url, usuarioId);
        res.json(scrapedData);
    } catch (error) {
        console.error('Error en POST /scrape:', error);
        next(error);
    }
});

// GET /api/links/stats/recent - Obtener los últimos 10 marcadores  más recientemente abiertos
/**
 * GET /api/links/stats/recent
 * @summary Obtiene los últimos 10 marcadores más recientemente visitados
 * @tags Bookmarks Stats
 * @security Bearer
 * @returns {object} 200 - Array de bookmarks recientes
 * @returns {object} 401 - No autenticado
 * @returns {object} 500 - Error interno
 */
router.get('/stats/recent', async (req, res, next) => {
    try {
        const usuarioId = req.usuario.id;
        const bookmarks = await bookmarkService.getRecentBookmarksService(db, usuarioId);
        res.json(bookmarks);
    } catch (error) {
        next(error);
    }
});

// GET /api/links - Obtener marcadores (con filtros opcionales)
/**
 * GET /api/links
 * @summary Obtiene marcadores del usuario con filtros
 * @tags Bookmarks
 * @security Bearer
 * @param {number} categoria_id.query - ID de carpeta para filtrar
 * @param {number} tag_id.query - ID de tag para filtrar
 * @param {string} search.query - Término de búsqueda
 * @param {boolean} all.query - Buscar en TODAS las carpetas
 * @param {number} limit.query - Máximo resultados
 * @param {number} offset.query - Resultados a saltar
 * @returns {object} 200 - Array de marcadores
 * @returns {object} 401 - No autenticado
 * @returns {object} 500 - Error interno
 */
router.get('/', async (req, res, next) => {
    try {
        const { categoria_id, tag_id, search, limit, offset, all } = req.query;
        const usuarioId = req.usuario.id;

        const bookmarks = await bookmarkService.getBookmarksWithTags(db, usuarioId, {
            categoria_id: categoria_id ? parseInt(categoria_id) : null,
            tag_id: tag_id ? parseInt(tag_id) : null,
            search,
            all: all === 'true',
            limit: limit ? parseInt(limit) : null,
            offset: offset ? parseInt(offset) : null
        });

        res.json(bookmarks);
    } catch (error) {
        next(error);
    }
});

// GET /api/links/stats/last-week - Obtener marcadores visitados última semana
/**
 * GET /api/links/stats/last-week
 * @summary Obtiene marcadores visitados en los últimos 7 días
 * @tags Bookmarks Stats
 * @security Bearer
 * @returns {object} 200 - Array de marcadores visitados recientemente
 * @returns {object} 401 - No autenticado
 * @returns {object} 500 - Error interno
 */
router.get('/stats/last-week', async (req, res, next) => {
    try {
        const usuarioId = req.usuario.id;
        const bookmarks = await bookmarkService.getRecentBookmarksService(db, usuarioId);
        res.json(bookmarks);
    } catch (error) {
        next(error);
    }
});

// GET /api/links/stats/count-last-week - Contar marcadores visitados última semana
/**
 * GET /api/links/stats/count-last-week
 * @summary Cuenta marcadores visitados en últimos 7 días
 * @tags Bookmarks Stats
 * @security Bearer
 * @returns {object} 200 - Conteo
 * @returns.count {number} - Cantidad de marcadores
 * @returns {object} 401 - No autenticado
 * @returns {object} 500 - Error interno
 */
router.get('/stats/count-last-week', async (req, res, next) => {
    try {
        const usuarioId = req.usuario.id;
        const stats = await bookmarkService.getBookmarkStats(db, usuarioId);
        res.json({ count: stats.thisWeek });
    } catch (error) {
        next(error);
    }
});

// GET /api/links/stats/count-all - Contar todos los marcadores del usuario
/**
 * GET /api/links/stats/count-all
 * @summary Cuenta TODOS los marcadores del usuario
 * @tags Bookmarks Stats
 * @security Bearer
 * @returns {object} 200 - Conteo total
 * @returns.count {number} - Total de marcadores
 * @returns {object} 401 - No autenticado
 * @returns {object} 500 - Error interno
 */
router.get('/stats/count-all', async (req, res, next) => {
    try {
        const usuarioId = req.usuario.id;
        const stats = await bookmarkService.getBookmarkStats(db, usuarioId);
        res.json({ count: stats.total });
    } catch (error) {
        next(error);
    }
});

// POST /api/links/refresh-github - Actualizar datos de GitHub de todos los marcadores
/**
 * POST /api/links/refresh-github
 * @summary Actualiza datos de GitHub (stars, forks) de TODOS los marcadores GitHub
 * @tags Bookmarks GitHub
 * @security Bearer
 * @returns {object} 200 - Resultado de la actualización
 * @returns.success {boolean} - true
 * @returns.total {number} - Total de marcadores GitHub
 * @returns.updated {number} - Total actualizado
 * @returns.failed {number} - Total fallido
 * @returns.results {array} - Detalle de cada marcador
 * @returns {object} 401 - No autenticado
 * @returns {object} 500 - Error interno
 */
router.post('/refresh-github', async (req, res, next) => {
    try {
        console.log('[GitHub Refresh] Iniciando actualización');
        
        const allBookmarks = await db.all(
            `SELECT id, url, titulo FROM Marcadores WHERE url LIKE '%github.com%'`
        );

        console.log(`[GitHub Refresh] Encontrados ${allBookmarks.length} marcadores`);

        let updated = 0;
        let failed = 0;
        const results = [];

        for (let bookmark of allBookmarks) {
            try {
                const gitHubData = await bookmarkService.refreshGitHubData(db, bookmark.id, bookmark.url);

                if (gitHubData) {
                    updated++;
                    results.push({
                        id: bookmark.id,
                        titulo: bookmark.titulo,
                        status: 'success',
                        data: gitHubData
                    });
                    console.log(`[GitHub Refresh] ✓ ${bookmark.titulo}`);
                } else {
                    failed++;
                    results.push({
                        id: bookmark.id,
                        titulo: bookmark.titulo,
                        status: 'failed',
                        error: 'No se obtuvieron datos'
                    });
                }
            } catch (error) {
                failed++;
                results.push({
                    id: bookmark.id,
                    titulo: bookmark.titulo,
                    status: 'error',
                    error: error.message
                });
            }
        }

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
 * @param {number} id.path - ID del marcador
 * @returns {object} 200 - Marcador encontrado
 * @returns {object} 401 - No autenticado
 * @returns {object} 404 - Marcador no encontrado
 * @returns {object} 500 - Error interno
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const bookmark = await bookmarkService.getBookmarkDetailService(db, id);

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
 * @requestBody.titulo {string} - Título (requerido)
 * @requestBody.url {string} - URL (requerido)
 * @requestBody.descripcion {string} - Descripción (opcional)
 * @requestBody.categoria_id {number} - ID de carpeta (opcional)
 * @requestBody.tag_ids {array} - Array de IDs de tags (opcional)
 * @requestBody.portada {file} - Imagen (opcional)
 * @returns {object} 201 - Marcador creado
 * @returns {object} 400 - Datos incompletos
 * @returns {object} 401 - No autenticado
 * @returns {object} 500 - Error interno
 */
router.post('/', async (req, res, next) => {
    try {
        const uploadSingle = upload.single('portada');
        
        uploadSingle(req, res, async (err) => {
            if (err) {
                return next(err);
            }

            try {
                let { titulo, url, descripcion, categoria_id, tag_ids } = req.body;

                if (!titulo || !url) {
                    return res.status(400).json({ error: 'El título y URL son requeridos' });
                }

                let portada = null;
                if (req.file) {
                    portada = req.file.buffer.toString('base64');
                }

                let parsedTags = [];
                if (tag_ids) {
                    try {
                        parsedTags = typeof tag_ids === 'string' ? JSON.parse(tag_ids) : tag_ids;
                    } catch (e) {
                        parsedTags = [];
                    }
                }

                const usuarioId = req.usuario.id;
                const newBookmark = await bookmarkService.createBookmarkWithTags(db, usuarioId, {
                    titulo,
                    url,
                    descripcion,
                    categoria_id: categoria_id ? parseInt(categoria_id) : null,
                    portada,
                    tag_ids: parsedTags
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
 * @param {number} id.path - ID del marcador
 * @requestBody {object} required - Datos a actualizar
 * @requestBody.titulo {string} - Título (opcional)
 * @requestBody.url {string} - URL (opcional)
 * @requestBody.descripcion {string} - Descripción (opcional)
 * @requestBody.categoria_id {number} - ID de carpeta (opcional)
 * @requestBody.tag_ids {array} - Array de IDs de tags (opcional)
 * @requestBody.portada {file} - Imagen (opcional)
 * @returns {object} 200 - Marcador actualizado
 * @returns {object} 401 - No autenticado
 * @returns {object} 404 - Marcador no encontrado
 * @returns {object} 500 - Error interno
 */
router.put('/:id', async (req, res, next) => {
    try {
        const uploadSingle = upload.single('portada');
        
        uploadSingle(req, res, async (err) => {
            if (err) {
                return next(err);
            }

            try {
                const { id } = req.params;
                let { titulo, url, descripcion, categoria_id, tag_ids, portada: bodyPortada } = req.body;

                let portada = undefined;
                if (req.file) {
                    portada = req.file.buffer.toString('base64');
                } else if (bodyPortada === '') {
                    portada = null;
                }

                let parsedTags = undefined;
                if (tag_ids) {
                    try {
                        parsedTags = typeof tag_ids === 'string' ? JSON.parse(tag_ids) : tag_ids;
                    } catch (e) {
                        parsedTags = undefined;
                    }
                }

                const updateData = { titulo, url, descripcion, portada, tag_ids: parsedTags };

                // Manejar categoria_id
                if (categoria_id !== undefined && categoria_id !== null) {
                    updateData.categoria_id = categoria_id === '' || categoria_id === '0' 
                        ? null 
                        : parseInt(categoria_id);
                }

                const updatedBookmark = await bookmarkService.updateBookmarkWithTags(db, id, updateData);
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
 * @param {number} id.path - ID del marcador
 * @returns {object} 200 - Marcador eliminado
 * @returns {object} 401 - No autenticado
 * @returns {object} 404 - Marcador no encontrado
 * @returns {object} 500 - Error interno
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await bookmarkService.deleteBookmarkService(db, id);
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
});

// POST /api/links/:id/tags - Agregar tags a un marcador
/**
 * POST /api/links/{id}/tags
 * @summary Agrega tags a un marcador
 * @tags Bookmarks
 * @security Bearer
 * @param {number} id.path - ID del marcador
 * @requestBody {object} required
 * @requestBody.tag_ids {array} - Array de IDs de tags
 * @returns {object} 200 - Tags agregados
 * @returns {object} 400 - tag_ids debe ser array
 * @returns {object} 401 - No autenticado
 * @returns {object} 500 - Error interno
 */
router.post('/:id/tags', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { tag_ids } = req.body;

        if (!tag_ids || !Array.isArray(tag_ids)) {
            return res.status(400).json({ error: 'tag_ids debe ser un array' });
        }

        await bookmarkService.recordBookmarkAccess(db, id);
        const bookmark = await bookmarkService.getBookmarkDetailService(db, id);
        res.json(bookmark.tags || []);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/links/:id/tags/:tag_id - Remover un tag de un marcador
/**
 * DELETE /api/links/{id}/tags/{tag_id}
 * @summary Elimina un tag de un marcador
 * @tags Bookmarks
 * @security Bearer
 * @param {number} id.path - ID del marcador
 * @param {number} tag_id.path - ID del tag
 * @returns {object} 200 - Tag eliminado
 * @returns.success {boolean} - true
 * @returns {object} 401 - No autenticado
 * @returns {object} 500 - Error interno
 */
router.delete('/:id/tags/:tag_id', async (req, res, next) => {
    try {
        const { id, tag_id } = req.params;
        await db.run(
            'DELETE FROM Marcadores_Tags WHERE marcador_id = ? AND tag_id = ?',
            [id, tag_id]
        );
        res.json({ success: true, message: 'Tag removido del marcador' });
    } catch (error) {
        next(error);
    }
});

// POST /api/links/:id/access - Registrar que se abrió el marcador
/**
 * POST /api/links/{id}/access
 * @summary Registra una visita/acceso a un marcador
 * @tags Bookmarks
 * @security Bearer
 * @param {number} id.path - ID del marcador
 * @returns {object} 200 - Acceso registrado
 * @returns.success {boolean} - true
 * @returns {object} 401 - No autenticado
 * @returns {object} 404 - Marcador no encontrado
 * @returns {object} 500 - Error interno
 */
router.post('/:id/access', async (req, res, next) => {
    try {
        const { id } = req.params;
        await bookmarkService.recordBookmarkAccess(db, id);
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
});

module.exports = router;


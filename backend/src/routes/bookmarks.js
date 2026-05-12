// Rutas para gestionar Marcadores (Bookmarks)
const express = require('express');
const router = express.Router();
const {
    getAllBookmarks,
    getBookmarkById,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    addTagsToBookmark,
    removeTagFromBookmark,
    getBookmarksByTag,
    recordBookmarkAccess,
    getBookmarksVisitedLastWeek,
    countBookmarksVisitedLastWeek
} = require('../controllers/bookmarksController');
const {
    scrapeUrl
} = require('../controllers/scrapingController');

let db;
let upload;

// Middleware para inyectar la conexión a la BD y multer
router.use((req, res, next) => {
    db = req.app.locals.db;
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
        res.json(scrapedData);
    } catch (error) {
        console.error('Error en POST /scrape:', error);
        next(error);
    }
});

// GET /api/links - Obtener todos los marcadores (con filtros opcionales)
router.get('/', async (req, res, next) => {
    try {
        const { categoria_id, tag_id, search, limit, offset } = req.query;

        const bookmarks = await getAllBookmarks(db, {
            categoria_id: categoria_id ? parseInt(categoria_id) : null,
            tag_id: tag_id ? parseInt(tag_id) : null,
            search,
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
        const bookmarks = await getBookmarksVisitedLastWeek(db);
        res.json(bookmarks);
    } catch (error) {
        next(error);
    }
});

// GET /api/links/stats/count-last-week - Contar marcadores visitados última semana
router.get('/stats/count-last-week', async (req, res, next) => {
    try {
        const count = await countBookmarksVisitedLastWeek(db);
        res.json({ count });
    } catch (error) {
        next(error);
    }
});

// GET /api/links/:id - Obtener un marcador específico
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const bookmark = await getBookmarkById(db, id);

        if (!bookmark) {
            return res.status(404).json({ error: 'Marcador no encontrado' });
        }

        res.json(bookmark);
    } catch (error) {
        next(error);
    }
});

// POST /api/links - Crear un nuevo marcador
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
                let { titulo, url, descripcion, categoria_id, tags } = req.body;

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
                
                const parsedCategoryId = categoria_id ? parseInt(categoria_id) : null;

                console.log('Creando bookmark:', { titulo, url, descripcion, parsedCategoryId, parsedTags, tienePortada: !!portada });

                const newBookmark = await createBookmark(db, {
                    titulo,
                    url,
                    descripcion,
                    portada,
                    categoria_id: parsedCategoryId,
                    tags: parsedTags || []
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
                let { titulo, url, descripcion, categoria_id, tags } = req.body;

                // Si se subió un archivo, convertir a base64
                let portada = undefined;
                if (req.file) {
                    // Convertir el buffer a base64
                    portada = req.file.buffer.toString('base64');
                    console.log(`Archivo recibido para actualización: ${req.file.originalname}, tamaño: ${req.file.size} bytes`);
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
                
                const parsedCategoryId = categoria_id ? parseInt(categoria_id) : undefined;

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

// GET /api/links/stats/last-week - Obtener marcadores visitados última semana (DUPLICADA - se mantiene abajo para mayor especificidad)
// router.get('/stats/last-week', async (req, res, next) => {
//     try {
//         const bookmarks = await getBookmarksVisitedLastWeek(db);
//         res.json(bookmarks);
//     } catch (error) {
//         next(error);
//     }
// });

// GET /api/links/stats/count-last-week - Contar marcadores visitados última semana (DUPLICADA)
// router.get('/stats/count-last-week', async (req, res, next) => {
//     try {
//         const count = await countBookmarksVisitedLastWeek(db);
//         res.json({ count });
//     } catch (error) {
//         next(error);
//     }
// });

module.exports = router;


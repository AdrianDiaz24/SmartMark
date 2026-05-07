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

let db;

// Middleware para inyectar la conexión a la BD
router.use((req, res, next) => {
    db = req.app.locals.db;
    next();
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
        const { titulo, url, descripcion, portada, categoria_id, tags } = req.body;

        if (!titulo || !url) {
            return res.status(400).json({ error: 'El título y URL son requeridos' });
        }

        const newBookmark = await createBookmark(db, {
            titulo,
            url,
            descripcion,
            portada,
            categoria_id,
            tags: tags || []
        });

        res.status(201).json(newBookmark);
    } catch (error) {
        next(error);
    }
});

// PUT /api/links/:id - Actualizar un marcador
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { titulo, url, descripcion, portada, categoria_id, tags } = req.body;

        const updatedBookmark = await updateBookmark(db, id, {
            titulo,
            url,
            descripcion,
            portada,
            categoria_id,
            tags
        });

        res.json(updatedBookmark);
    } catch (error) {
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


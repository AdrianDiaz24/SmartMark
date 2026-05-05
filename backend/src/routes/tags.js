// Rutas para gestionar Tags
const express = require('express');
const router = express.Router();
const {
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag
} = require('../controllers/tagsController');

let db;

// Middleware para inyectar la conexión a la BD
router.use((req, res, next) => {
    db = req.app.locals.db;
    next();
});

// GET /api/tags - Obtener todos los tags
router.get('/', async (req, res, next) => {
    try {
        const tags = await getAllTags(db);
        res.json(tags);
    } catch (error) {
        next(error);
    }
});

// GET /api/tags/:id - Obtener un tag específico
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const tag = await getTagById(db, id);

        if (!tag) {
            return res.status(404).json({ error: 'Tag no encontrado' });
        }

        res.json(tag);
    } catch (error) {
        next(error);
    }
});

// POST /api/tags - Crear un nuevo tag
router.post('/', async (req, res, next) => {
    try {
        const { nombre, color } = req.body;

        if (!nombre || !color) {
            return res.status(400).json({ error: 'El nombre y color son requeridos' });
        }

        const newTag = await createTag(db, nombre, color);
        res.status(201).json(newTag);
    } catch (error) {
        next(error);
    }
});

// PUT /api/tags/:id - Actualizar un tag
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, color } = req.body;

        const updatedTag = await updateTag(db, id, nombre, color);
        res.json(updatedTag);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/tags/:id - Eliminar un tag
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await deleteTag(db, id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;


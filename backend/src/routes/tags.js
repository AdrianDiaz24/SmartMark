/**
 * @fileoverview Rutas para gestionar Tags - CRUD y estadísticas
 * @module routes/tags
 */

const express = require('express');
const router = express.Router();
const {
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag,
    getTagStats
} = require('../controllers/tagsController');

let db;

// Middleware para inyectar la conexión a la BD
router.use((req, res, next) => {
    db = req.db;
    next();
});

// GET /api/tags - Obtener todos los tags del usuario
/**
 * GET /api/tags
 * @summary Obtiene todos los tags del usuario autenticado
 * @tags Tags
 * @security Bearer
 * @returns {array} 200 - Array de tags con nombre y color hex
 * @returns {object} 401 - No autenticado
 * @returns {object} 500 - Error interno del servidor
 */
router.get('/', async (req, res, next) => {
    try {
        const usuarioId = req.usuario.id;
        const tags = await getAllTags(db, usuarioId);
        res.json(tags);
    } catch (error) {
        next(error);
    }
});

// GET /api/tags/:id - Obtener un tag específico
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;
        const tag = await getTagById(db, usuarioId, id);

        if (!tag) {
            return res.status(404).json({ error: 'Tag no encontrado' });
        }

        // Obtener estadísticas del tag
        const stats = await getTagStats(db, usuarioId, id);
        tag.bookmarks = stats.bookmarks;
        tag.categories = stats.categories;

        res.json(tag);
    } catch (error) {
        next(error);
    }
});

// POST /api/tags - Crear un nuevo tag
/**
 * POST /api/tags
 * @summary Crea un nuevo tag
 * @tags Tags
 * @security Bearer
 * @requestBody {object} required - Datos del nuevo tag
 * @requestBody.nombre {string} - Nombre del tag (requerido)
 * @requestBody.color {string} - Color en formato hex (requerido, ej: #FF5733)
 * @returns {object} 201 - Tag creado exitosamente
 * @returns {object} 400 - Nombre o color faltantes
 * @returns {object} 401 - No autenticado
 * @returns {object} 500 - Error interno del servidor
 */
router.post('/', async (req, res, next) => {
    try {
        const { nombre, color } = req.body;
        const usuarioId = req.usuario.id;

        if (!nombre || !color) {
            return res.status(400).json({ error: 'El nombre y color son requeridos' });
        }

        const newTag = await createTag(db, usuarioId, nombre, color);
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
        const usuarioId = req.usuario.id;

        const updatedTag = await updateTag(db, usuarioId, id, nombre, color);
        res.json(updatedTag);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/tags/:id - Eliminar un tag
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;
        const result = await deleteTag(db, usuarioId, id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;


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
const validate = require('../middleware/validation');
const { createTagSchema, updateTagSchema } = require('../schemas/tagSchemas');

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
 * @returns {object} 200 - Array de tags con nombre y color hex
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
/**
 * GET /api/tags/{id}
 * @summary Obtiene un tag específico con estadísticas
 * @tags Tags
 * @security Bearer
 * @param {number} id.path - ID del tag (requerido)
 * @returns {object} 200 - Tag encontrado
 * @returns.id {number} - ID del tag
 * @returns.nombre {string} - Nombre del tag
 * @returns.color {string} - Color hex (ej: #FF5733)
 * @returns.usuario_id {number} - ID del usuario propietario
 * @returns.bookmarks {number} - Cantidad de marcadores con este tag
 * @returns.categories {number} - Cantidad de carpetas que usan este tag
 * @returns {object} 401 - No autenticado
 * @returns {object} 404 - Tag no encontrado
 * @returns {object} 500 - Error interno
 */
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
 * @requestBody.nombre {string} - Nombre del tag (requerido, 2-50 caracteres)
 * @requestBody.color {string} - Color en formato hex (requerido, ej: #FF5733)
 * @returns {object} 201 - Tag creado exitosamente
 * @returns {object} 400 - Nombre o color inválidos
 * @returns {object} 401 - No autenticado
 * @returns {object} 500 - Error interno del servidor
 */
router.post('/', validate(createTagSchema), async (req, res, next) => {
    try {
        const { nombre, color } = req.body;
        const usuarioId = req.usuario.id;


        const newTag = await createTag(db, usuarioId, nombre, color);
        res.status(201).json(newTag);
    } catch (error) {
        next(error);
    }
});

// PUT /api/tags/:id - Actualizar un tag
/**
 * PUT /api/tags/{id}
 * @summary Actualiza un tag existente
 * @tags Tags
 * @security Bearer
 * @param {number} id.path - ID del tag (requerido)
 * @requestBody {object} required
 * @requestBody.nombre {string} - Nuevo nombre del tag (opcional, 2-50 caracteres)
 * @requestBody.color {string} - Nuevo color hex (opcional, ej: #FF5733)
 * @returns {object} 200 - Tag actualizado
 * @returns.id {number} - ID del tag
 * @returns.nombre {string} - Nombre actualizado
 * @returns.color {string} - Color actualizado
 * @returns {object} 401 - No autenticado
 * @returns {object} 404 - Tag no encontrado
 * @returns {object} 500 - Error interno
 */
router.put('/:id', validate(updateTagSchema), async (req, res, next) => {
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
/**
 * DELETE /api/tags/{id}
 * @summary Elimina un tag
 * @tags Tags
 * @security Bearer
 * @param {number} id.path - ID del tag (requerido)
 * @returns {object} 200 - Tag eliminado
 * @returns.success {boolean} - true
 * @returns.message {string} - "Tag eliminado"
 * @returns.bookmarksAffected {number} - Marcadores que tenían este tag
 * @returns {object} 401 - No autenticado
 * @returns {object} 404 - Tag no encontrado
 * @returns {object} 500 - Error interno
 */
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


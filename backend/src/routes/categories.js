/**
 * @fileoverview Rutas para gestionar Categorías (Carpetas) - CRUD y relaciones con tags
 * @module routes/categories
 */

const express = require('express');
const router = express.Router();
const {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getTagsByCategory,
    addTagsToCategory,
    removeTagFromCategory
} = require('../controllers/categoriesController');

let db;

// Middleware para inyectar la conexión a la BD
router.use((req, res, next) => {
    db = req.db;
    next();
});

// GET /api/categories - Obtener todas las categorías del usuario
/**
 * GET /api/categories
 * @summary Obtiene todas las carpetas del usuario autenticado
 * @tags Categories
 * @security Bearer
 * @returns {object} 200 - Array de carpetas con estructura jerárquica
 * @returns {object} 401 - No autenticado
 * @returns {object} 500 - Error interno del servidor
 */
router.get('/', async (req, res, next) => {
    try {
        const usuarioId = req.usuario.id;
        const categories = await getAllCategories(db, usuarioId);
        res.json(categories);
    } catch (error) {
        next(error);
    }
});

// GET /api/categories/:id - Obtener una categoría específica
/**
 * GET /api/categories/{id}
 * @summary Obtiene una carpeta específica por ID
 * @tags Categories
 * @security Bearer
 * @param {number} id.path - ID de la carpeta (requerido)
 * @returns {object} 200 - Carpeta encontrada
 * @returns.id {number} - ID de la carpeta
 * @returns.nombre {string} - Nombre de la carpeta
 * @returns.padre_id {number|null} - ID de la carpeta padre (null si es raíz)
 * @returns.usuario_id {number} - ID del usuario propietario
 * @returns.bookmarkCount {number} - Cantidad de marcadores en esta carpeta
 * @returns.subcarpetas {array} - Array de subcarpetas
 * @returns {object} 401 - No autenticado
 * @returns {object} 404 - Carpeta no encontrada
 * @returns {object} 500 - Error interno
 */
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const usuarioId = req.usuario.id;
        const category = await getCategoryById(db, usuarioId, id);

        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json(category);
    } catch (error) {
        next(error);
    }
});

// POST /api/categories - Crear una nueva categoría
/**
 * POST /api/categories
 * @summary Crea una nueva carpeta
 * @tags Categories
 * @security Bearer
 * @requestBody {object} required - Datos de la nueva carpeta
 * @requestBody.nombre {string} - Nombre de la carpeta (requerido)
 * @requestBody.padre_id {number} - ID de carpeta padre para subcarpetas (opcional)
 * @requestBody.tags {array} - Array de IDs de tags (opcional)
 * @returns {object} 201 - Carpeta creada exitosamente
 * @returns {object} 400 - Nombre faltante
 * @returns {object} 401 - No autenticado
 * @returns {object} 500 - Error interno del servidor
 */
router.post('/', async (req, res, next) => {
    try {
        const { nombre, padre_id, tags } = req.body;
        const usuarioId = req.usuario.id;

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }

        const newCategory = await createCategory(db, usuarioId, nombre, padre_id, tags || []);
        res.status(201).json(newCategory);
    } catch (error) {
        next(error);
    }
});

// PUT /api/categories/:id - Actualizar una categoría
/**
 * PUT /api/categories/{id}
 * @summary Actualiza una carpeta existente
 * @tags Categories
 * @security Bearer
 * @param {number} id.path - ID de la carpeta (requerido)
 * @requestBody {object} required
 * @requestBody.nombre {string} - Nuevo nombre de la carpeta (opcional)
 * @requestBody.padre_id {number|null} - Nuevo ID de carpeta padre para mover (opcional)
 * @example
 * {
 *   "nombre": "Mi Carpeta Actualizada",
 *   "padre_id": null
 * }
 * @returns {object} 200 - Carpeta actualizada
 * @returns.id {number} - ID de la carpeta
 * @returns.nombre {string} - Nombre actualizado
 * @returns.padre_id {number|null} - Carpeta padre (null si es raíz)
 * @returns {object} 401 - No autenticado
 * @returns {object} 404 - Carpeta no encontrada
 * @returns {object} 500 - Error interno
 */
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, padre_id } = req.body;
        const usuarioId = req.usuario.id;

        const updatedCategory = await updateCategory(db, usuarioId, id, nombre, padre_id);
        res.json(updatedCategory);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/categories/:id - Eliminar una categoría
/**
 * DELETE /api/categories/{id}
 * @summary Elimina una carpeta
 * @tags Categories
 * @security Bearer
 * @param {number} id.path - ID de la carpeta (requerido)
 * @param {boolean} deleteBookmarks.query - Si es true, también elimina marcadores en carpeta (opcional, default: false)
 * @example /api/categories/5?deleteBookmarks=false
 * @returns {object} 200 - Carpeta eliminada
 * @returns.success {boolean} - true
 * @returns.message {string} - "Categoría eliminada"
 * @returns.bookmarksMovedToGeneral {number} - Marcadores movidos à sección general
 * @returns.bookmarksDeleted {number} - Marcadores eliminados (si deleteBookmarks=true)
 * @returns {object} 401 - No autenticado
 * @returns {object} 404 - Carpeta no encontrada
 * @returns {object} 500 - Error interno
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { deleteBookmarks } = req.query;
        const usuarioId = req.usuario.id;

        const result = await deleteCategory(db, usuarioId, id, deleteBookmarks === 'true');
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// POST /api/categories/:id/tags - Agregar tags a una categoría
router.post('/:id/tags', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { tag_ids } = req.body;

        if (!tag_ids || !Array.isArray(tag_ids)) {
            return res.status(400).json({ error: 'tag_ids debe ser un array' });
        }

        const tags = await addTagsToCategory(db, id, tag_ids);
        res.json(tags);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/categories/:id/tags/:tag_id - Remover un tag de una categoría
router.delete('/:id/tags/:tag_id', async (req, res, next) => {
    try {
        const { id, tag_id } = req.params;
        const result = await removeTagFromCategory(db, id, tag_id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;


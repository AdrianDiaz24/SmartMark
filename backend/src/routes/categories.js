// Rutas para gestionar Categorías
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
    db = req.app.locals.db;
    next();
});

// GET /api/categories - Obtener todas las categorías
router.get('/', async (req, res, next) => {
    try {
        const categories = await getAllCategories(db);
        res.json(categories);
    } catch (error) {
        next(error);
    }
});

// GET /api/categories/:id - Obtener una categoría específica
router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const category = await getCategoryById(db, id);

        if (!category) {
            return res.status(404).json({ error: 'Categoría no encontrada' });
        }

        res.json(category);
    } catch (error) {
        next(error);
    }
});

// POST /api/categories - Crear una nueva categoría
router.post('/', async (req, res, next) => {
    try {
        const { nombre, padre_id, tags } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: 'El nombre es requerido' });
        }

        const newCategory = await createCategory(db, nombre, padre_id, tags || []);
        res.status(201).json(newCategory);
    } catch (error) {
        next(error);
    }
});

// PUT /api/categories/:id - Actualizar una categoría
router.put('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { nombre, padre_id } = req.body;

        const updatedCategory = await updateCategory(db, id, nombre, padre_id);
        res.json(updatedCategory);
    } catch (error) {
        next(error);
    }
});

// DELETE /api/categories/:id - Eliminar una categoría
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { deleteBookmarks } = req.query;

        const result = await deleteCategory(db, id, deleteBookmarks === 'true');
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


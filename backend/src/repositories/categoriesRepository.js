/**
 * @fileoverview Repositorio de Categorías - Abstrae operaciones SQL
 * @module repositories/categoriesRepository
 */

/**
 * Obtiene todas las categorías de un usuario
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Array>} Array de categorías
 */
async function getAllCategories(db, usuarioId) {
    try {
        const categories = await db.all(
            `SELECT * FROM Categorias WHERE usuario_id = ? ORDER BY nombre ASC`,
            [usuarioId]
        );
        return categories;
    } catch (error) {
        throw new Error(`Error al obtener categorías: ${error.message}`);
    }
}

/**
 * Obtiene una categoría por ID
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} categoryId - ID de la categoría
 * @returns {Promise<Object>} Objeto categoría
 */
async function getCategoryById(db, categoryId) {
    try {
        const category = await db.get(
            `SELECT * FROM Categorias WHERE id = ?`,
            [categoryId]
        );
        return category;
    } catch (error) {
        throw new Error(`Error al obtener categoría: ${error.message}`);
    }
}

/**
 * Crea una nueva categoría
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {Object} categoryData - Datos de la categoría
 * @returns {Promise<Object>} Categoría creada
 */
async function createCategory(db, categoryData) {
    try {
        const { usuario_id, nombre, descripcion, padre_id } = categoryData;

        const result = await db.run(
            `INSERT INTO Categorias (usuario_id, nombre, descripcion, padre_id, fecha_creacion)
             VALUES (?, ?, ?, ?, datetime('now'))`,
            [usuario_id, nombre, descripcion, padre_id || null]
        );

        return { id: result.lastID, ...categoryData, fecha_creacion: new Date().toISOString() };
    } catch (error) {
        throw new Error(`Error al crear categoría: ${error.message}`);
    }
}

/**
 * Actualiza una categoría
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} categoryId - ID de la categoría
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Resultado
 */
async function updateCategory(db, categoryId, updateData) {
    try {
        const fields = Object.keys(updateData)
            .map(key => `${key} = ?`)
            .join(', ');

        const values = [...Object.values(updateData), categoryId];

        const result = await db.run(
            `UPDATE Categorias SET ${fields} WHERE id = ?`,
            values
        );

        return result;
    } catch (error) {
        throw new Error(`Error al actualizar categoría: ${error.message}`);
    }
}

/**
 * Elimina una categoría
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} categoryId - ID de la categoría
 * @param {boolean} deleteBookmarks - Si true, elimina los bookmarks; si false los mueve a general
 * @returns {Promise<Object>} Resultado
 */
async function deleteCategory(db, categoryId, deleteBookmarks = false) {
    try {
        if (!deleteBookmarks) {
            // Mover bookmarks a general (sin categoría)
            await db.run(
                `UPDATE Marcadores SET categoria_id = NULL WHERE categoria_id = ?`,
                [categoryId]
            );
        } else {
            // Eliminar bookmarks de la categoría
            const bookmarks = await db.all(
                `SELECT id FROM Marcadores WHERE categoria_id = ?`,
                [categoryId]
            );

            for (let bookmark of bookmarks) {
                await db.run(
                    `DELETE FROM Marcadores_Tags WHERE marcador_id = ?`,
                    [bookmark.id]
                );
            }

            await db.run(
                `DELETE FROM Marcadores WHERE categoria_id = ?`,
                [categoryId]
            );
        }

        // Eliminar subcategorías
        await db.run(
            `DELETE FROM Categorias WHERE padre_id = ?`,
            [categoryId]
        );

        // Eliminar categoría
        const result = await db.run(
            `DELETE FROM Categorias WHERE id = ?`,
            [categoryId]
        );

        return result;
    } catch (error) {
        throw new Error(`Error al eliminar categoría: ${error.message}`);
    }
}

/**
 * Obtiene bookmarks de una categoría
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} categoryId - ID de la categoría
 * @returns {Promise<Array>} Array de bookmarks
 */
async function getCategoryBookmarks(db, categoryId) {
    try {
        const bookmarks = await db.all(
            `SELECT * FROM Marcadores WHERE categoria_id = ? ORDER BY fecha_creacion DESC`,
            [categoryId]
        );
        return bookmarks;
    } catch (error) {
        throw new Error(`Error al obtener bookmarks de categoría: ${error.message}`);
    }
}

/**
 * Cuenta todas las subcarpetas recursivamente
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} parentId - ID de la categoría padre
 * @returns {Promise<number>} Total de subcarpetas recursivas
 */
async function countSubcategoriesRecursive(db, parentId) {
    try {
        // Contar subcategorías directas
        const directSubs = await db.all(
            `SELECT id FROM Categorias WHERE padre_id = ?`,
            [parentId]
        );

        let total = directSubs.length;

        // Recursivamente contar subcategorías de cada subcategoría
        for (let sub of directSubs) {
            const subcount = await countSubcategoriesRecursive(db, sub.id);
            total += subcount;
        }

        return total;
    } catch (error) {
        throw new Error(`Error al contar subcategorías recursivas: ${error.message}`);
    }
}

/**
 * Obtiene estadísticas de una categoría (cantidad de subcarpetas recursivas y marcadores)
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} categoryId - ID de la categoría
 * @returns {Promise<Object>} Estadísticas con total de subcarpetas recursivas
 */
async function getCategoryStats(db, categoryId) {
    try {
        // Contar subcarpetas recursivamente
        const subfolderCount = await countSubcategoriesRecursive(db, categoryId);

        // Contar marcadores directos en esta categoría
        const bookmarks = await db.get(
            `SELECT COUNT(*) as count FROM Marcadores WHERE categoria_id = ?`,
            [categoryId]
        );

        return {
            bookmarks: bookmarks?.count || 0,
            subfolders: subfolderCount
        };
    } catch (error) {
        throw new Error(`Error al obtener estadísticas de categoría: ${error.message}`);
    }
}

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryBookmarks,
    getCategoryStats,
    countSubcategoriesRecursive
};







/**
 * @fileoverview Repositorio de Tags - Abstrae operaciones SQL
 * @module repositories/tagsRepository
 */

/**
 * Obtiene todos los tags de un usuario
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Array>} Array de tags
 */
async function getAllTags(db, usuarioId) {
    try {
        const tags = await db.all(
            `SELECT * FROM Tags WHERE usuario_id = ? ORDER BY nombre ASC`,
            [usuarioId]
        );
        return tags;
    } catch (error) {
        throw new Error(`Error al obtener tags: ${error.message}`);
    }
}

/**
 * Obtiene un tag por ID
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} tagId - ID del tag
 * @returns {Promise<Object>} Objeto tag
 */
async function getTagById(db, tagId) {
    try {
        const tag = await db.get(
            `SELECT * FROM Tags WHERE id = ?`,
            [tagId]
        );
        return tag;
    } catch (error) {
        throw new Error(`Error al obtener tag: ${error.message}`);
    }
}

/**
 * Crea un nuevo tag
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {Object} tagData - Datos del tag
 * @returns {Promise<Object>} Tag creado
 */
async function createTag(db, tagData) {
    try {
        const { usuario_id, nombre, color } = tagData;

        const result = await db.run(
            `INSERT INTO Tags (usuario_id, nombre, color, fecha_creacion)
             VALUES (?, ?, ?, datetime('now'))`,
            [usuario_id, nombre, color]
        );

        return { id: result.lastID, ...tagData, fecha_creacion: new Date().toISOString() };
    } catch (error) {
        throw new Error(`Error al crear tag: ${error.message}`);
    }
}

/**
 * Actualiza un tag
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} tagId - ID del tag
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Resultado
 */
async function updateTag(db, tagId, updateData) {
    try {
        const fields = Object.keys(updateData)
            .map(key => `${key} = ?`)
            .join(', ');

        const values = [...Object.values(updateData), tagId];

        const result = await db.run(
            `UPDATE Tags SET ${fields} WHERE id = ?`,
            values
        );

        return result;
    } catch (error) {
        throw new Error(`Error al actualizar tag: ${error.message}`);
    }
}

/**
 * Elimina un tag
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} tagId - ID del tag
 * @returns {Promise<Object>} Resultado
 */
async function deleteTag(db, tagId) {
    try {
        // Eliminar asociaciones
        await db.run(
            `DELETE FROM Marcadores_Tags WHERE tag_id = ?`,
            [tagId]
        );

        // Eliminar tag
        const result = await db.run(
            `DELETE FROM Tags WHERE id = ?`,
            [tagId]
        );

        return result;
    } catch (error) {
        throw new Error(`Error al eliminar tag: ${error.message}`);
    }
}

/**
 * Obtiene estadísticas de un tag
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} tagId - ID del tag
 * @returns {Promise<Object>} Estadísticas
 */
async function getTagStats(db, tagId) {
    try {
        const bookmarkCount = await db.get(
            `SELECT COUNT(DISTINCT marcador_id) as count FROM Marcadores_Tags WHERE tag_id = ?`,
            [tagId]
        );

        const categoryCount = await db.get(
            `SELECT COUNT(DISTINCT m.categoria_id) as count FROM Marcadores m
             INNER JOIN Marcadores_Tags mt ON m.id = mt.marcador_id
             WHERE mt.tag_id = ? AND m.categoria_id IS NOT NULL`,
            [tagId]
        );

        return {
            bookmarks: bookmarkCount?.count || 0,
            categories: categoryCount?.count || 0
        };
    } catch (error) {
        throw new Error(`Error al obtener estadísticas de tag: ${error.message}`);
    }
}

module.exports = {
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag,
    getTagStats
};


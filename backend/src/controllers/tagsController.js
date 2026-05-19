// Controlador para gestionar todas las operaciones de Tags

/**
 * Obtiene todos los tags de la base de datos
 * @async
 * @function getAllTags
 * @param {Object} db - Instancia de la base de datos SQLite
 * @returns {Promise<Array>} Array de objetos tag con propiedades: id, nombre, color, fecha_creacion
 * @throws {Error} Si hay un error al consultar la base de datos
 *
 * @example
 * const tags = await getAllTags(db);
 * // Retorna: [
 * //   { id: 1, nombre: 'React', color: 'FF5733', fecha_creacion: '2026-05-19T10:30:00Z' },
 * //   { id: 2, nombre: 'Node.js', color: '3498DB', fecha_creacion: '2026-05-18T15:45:00Z' }
 * // ]
 */
async function getAllTags(db) {
    try {
        const tags = await db.all(`
            SELECT id, nombre, color, fecha_creacion FROM Tags
            ORDER BY fecha_creacion DESC
        `);
        return tags;
    } catch (error) {
        throw new Error(`Error al obtener tags: ${error.message}`);
    }
}

/**
 * Obtiene un tag específico por su ID
 * @async
 * @function getTagById
 * @param {Object} db - Instancia de la base de datos SQLite
 * @param {number} id - ID del tag a obtener
 * @returns {Promise<Object|undefined>} Objeto tag con propiedades: id, nombre, color, fecha_creacion
 * @throws {Error} Si hay un error al consultar la base de datos
 *
 * @example
 * const tag = await getTagById(db, 1);
 * // Retorna: { id: 1, nombre: 'React', color: 'FF5733', fecha_creacion: '2026-05-19T10:30:00Z' }
 */
async function getTagById(db, id) {
    try {
        const tag = await db.get(`
            SELECT id, nombre, color, fecha_creacion FROM Tags WHERE id = ?
        `, [id]);
        return tag;
    } catch (error) {
        throw new Error(`Error al obtener tag: ${error.message}`);
    }
}

/**
 * Crea un nuevo tag (etiqueta) en la base de datos
 * @async
 * @function createTag
 * @param {Object} db - Instancia de la base de datos SQLite
 * @param {string} nombre - Nombre del tag (debe ser único y no vacío)
 * @param {string} color - Color en formato hexadecimal (ej: "FF5733" o "#FF5733")
 * @returns {Promise<Object>} Objeto del tag creado con propiedades: id, nombre, color, fecha_creacion
 * @throws {Error} Si el nombre está vacío, el color es inválido, o el nombre ya existe
 *
 * @example
 * // Crear un nuevo tag
 * const nuevoTag = await createTag(db, 'React', 'FF5733');
 * // Retorna: { id: 1, nombre: 'React', color: 'FF5733', fecha_creacion: '2026-05-19T10:30:00Z' }
 */
async function createTag(db, nombre, color) {
    try {
        if (!nombre || nombre.trim() === '') {
            throw new Error('El nombre del tag es requerido');
        }

        if (!color || !/^#?[0-9A-Fa-f]{6}$/.test(color)) {
            throw new Error('El color debe ser un valor hexadecimal válido (ej: #FF5733 o FF5733)');
        }
        const colorFormato = color.startsWith('#') ? color.substring(1) : color;

        // Verificar que el nombre sea único
        const existe = await db.get(`
            SELECT id FROM Tags WHERE nombre = ?
        `, [nombre.trim()]);

        if (existe) {
            throw new Error('Ya existe un tag con este nombre');
        }

        const resultado = await db.run(`
            INSERT INTO Tags (nombre, color, fecha_creacion)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        `, [nombre.trim(), colorFormato]);

        return {
            id: resultado.lastID,
            nombre: nombre.trim(),
            color: colorFormato,
            fecha_creacion: new Date().toISOString()
        };
    } catch (error) {
        throw new Error(`Error al crear tag: ${error.message}`);
    }
}

/**
 * Actualiza un tag existente
 * @async
 * @function updateTag
 * @param {Object} db - Instancia de la base de datos SQLite
 * @param {number} id - ID del tag a actualizar
 * @param {string} [nombre] - Nuevo nombre del tag (opcional)
 * @param {string} [color] - Nuevo color en formato hexadecimal (opcional)
 * @returns {Promise<Object>} Tag actualizado con todas sus propiedades
 * @throws {Error} Si el tag no existe, el nombre ya está en uso, o el color es inválido
 *
 * @example
 * // Actualizar solo el nombre
 * const updated = await updateTag(db, 1, 'Vue.js');
 *
 * @example
 * // Actualizar solo el color
 * const updated = await updateTag(db, 1, undefined, '#E74C3C');
 */
async function updateTag(db, id, nombre, color) {
    try {
        const tag = await db.get(`SELECT * FROM Tags WHERE id = ?`, [id]);
        if (!tag) {
            throw new Error('Tag no encontrado');
        }

        const nombreFinal = nombre || tag.nombre;
        let colorFinal = color || tag.color;

        // Validar color si se proporciona
        if (color && !/^#?[0-9A-Fa-f]{6}$/.test(color)) {
            throw new Error('El color debe ser un valor hexadecimal válido (ej: #FF5733 o FF5733)');
        }

        // Asegurar que el color NO tenga el # (guardar sin #)
        if (color) {
            colorFinal = color.startsWith('#') ? color.substring(1) : color;
        }

        // Si cambio el nombre, verificar que sea único
        if (nombre && nombre !== tag.nombre) {
            const existe = await db.get(`
                SELECT id FROM Tags WHERE nombre = ? AND id != ?
            `, [nombre.trim(), id]);
            if (existe) {
                throw new Error('Ya existe otro tag con este nombre');
            }
        }

        await db.run(`
            UPDATE Tags SET nombre = ?, color = ? WHERE id = ?
        `, [nombreFinal, colorFinal, id]);

        return getTagById(db, id);
    } catch (error) {
        throw new Error(`Error al actualizar tag: ${error.message}`);
    }
}

// ...existing code...

/**
 * Elimina un tag de la base de datos y todas sus relaciones
 * @async
 * @function deleteTag
 * @param {Object} db - Instancia de la base de datos SQLite
 * @param {number} id - ID del tag a eliminar
 * @returns {Promise<Object>} Objeto de confirmación con mensaje de éxito
 * @throws {Error} Si el tag no existe o hay error al eliminar
 *
 * @example
 * const result = await deleteTag(db, 1);
 * // Retorna: { mensaje: 'Tag eliminado exitosamente' }
 */
async function deleteTag(db, id) {
    try {
        const tag = await db.get(`SELECT * FROM Tags WHERE id = ?`, [id]);
        if (!tag) {
            throw new Error('Tag no encontrado');
        }

        // Eliminar todas las relaciones de este tag con marcadores
        await db.run(`
            DELETE FROM Marcadores_Tags WHERE tag_id = ?
        `, [id]);

        // Eliminar el tag
        await db.run(`
            DELETE FROM Tags WHERE id = ?
        `, [id]);

        return { mensaje: 'Tag eliminado exitosamente' };
    } catch (error) {
        throw new Error(`Error al eliminar tag: ${error.message}`);
    }
}

/**
 * Obtiene todos los tags asociados a un marcador específico
 * @async
 * @function getTagsByBookmark
 * @param {Object} db - Instancia de la base de datos SQLite
 * @param {number} bookmarkId - ID del marcador
 * @returns {Promise<Array>} Array de tags asociados al marcador
 * @throws {Error} Si hay error al consultar la base de datos
 *
 * @example
 * const tags = await getTagsByBookmark(db, 5);
 * // Retorna: [
 * //   { id: 1, nombre: 'React', color: 'FF5733', fecha_creacion: '2026-05-19T10:30:00Z' },
 * //   { id: 3, nombre: 'Frontend', color: '9B59B6', fecha_creacion: '2026-05-19T11:15:00Z' }
 * // ]
 */
async function getTagsByBookmark(db, bookmarkId) {
    try {
        const tags = await db.all(`
            SELECT t.id, t.nombre, t.color, t.fecha_creacion
            FROM Tags t
            INNER JOIN Marcadores_Tags mt ON t.id = mt.tag_id
            WHERE mt.marcador_id = ?
            ORDER BY t.fecha_creacion DESC
        `, [bookmarkId]);
        return tags;
    } catch (error) {
        throw new Error(`Error al obtener tags del marcador: ${error.message}`);
    }
}

/**
 * Obtiene estadísticas de uso de un tag específico
 * @async
 * @function getTagStats
 * @param {Object} db - Instancia de la base de datos SQLite
 * @param {number} tagId - ID del tag para obtener estadísticas
 * @returns {Promise<Object>} Objeto con estadísticas: { bookmarks: number, categories: number }
 * @throws {Error} Si hay error al consultar la base de datos
 *
 * @example
 * const stats = await getTagStats(db, 1);
 * // Retorna: { bookmarks: 12, categories: 3 }
 */
async function getTagStats(db, tagId) {
    try {
        // Contar marcadores con este tag
        const bookmarksResult = await db.get(`
            SELECT COUNT(*) as count FROM Marcadores_Tags WHERE tag_id = ?
        `, [tagId]);

        // Contar carpetas con este tag
        const categoriesResult = await db.get(`
            SELECT COUNT(*) as count FROM Categorias_Tags WHERE tag_id = ?
        `, [tagId]);

        return {
            bookmarks: bookmarksResult?.count || 0,
            categories: categoriesResult?.count || 0
        };
    } catch (error) {
        throw new Error(`Error al obtener estadísticas del tag: ${error.message}`);
    }
}

module.exports = {
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag,
    getTagsByBookmark,
    getTagStats
};


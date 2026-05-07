// Controlador para gestionar todas las operaciones de Tags

// Obtener todos los tags
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

// Obtener un tag específico por ID
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

// Crear un nuevo tag
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

// Actualizar un tag
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

// Eliminar un tag
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

// Obtener tags de un marcador específico
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

// Obtener estadísticas de un tag
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


/**
 * @fileoverview Repositorio de Bookmarks - Abstrae todas las operaciones SQL
 * @module repositories/bookmarksRepository
 */

/**
 * Obtiene marcadores con filtros opcionales
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} usuarioId - ID del usuario
 * @param {Object} filters - Filtros
 * @returns {Promise<Array>} Array de bookmarks
 */
async function getBookmarks(db, usuarioId, filters = {}) {
    try {
        let query = `
            SELECT DISTINCT m.id, m.titulo, m.url, m.descripcion, m.portada, 
                   m.categoria_id, m.fecha_creacion, m.ultima_apertura,
                   m.github_stars, m.github_forks, m.github_watchers, m.github_languages,
                   m.url_estado, m.ultima_verificacion
            FROM Marcadores m
            LEFT JOIN Marcadores_Tags mt ON m.id = mt.marcador_id
            LEFT JOIN Tags t ON mt.tag_id = t.id
            WHERE m.usuario_id = ?
        `;
        const params = [usuarioId];

        // Filtrar por categoría
        if (filters.categoria_id) {
            query += ` AND m.categoria_id = ?`;
            params.push(filters.categoria_id);
        } else if (!filters.search && !filters.all) {
            query += ` AND m.categoria_id IS NULL`;
        }

        // Filtrar por tag
        if (filters.tag_id) {
            query += ` AND mt.tag_id = ?`;
            params.push(filters.tag_id);
        }

        // Filtrar por búsqueda
        if (filters.search) {
            query += ` AND (m.titulo LIKE ? OR m.descripcion LIKE ? OR t.nombre LIKE ?)`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ` ORDER BY m.fecha_creacion DESC`;

        // Aplicar límite y offset
        if (filters.limit) {
            query += ` LIMIT ?`;
            params.push(filters.limit);
            if (filters.offset) {
                query += ` OFFSET ?`;
                params.push(filters.offset);
            }
        }

        const bookmarks = await db.all(query, params);
        return bookmarks;
    } catch (error) {
        throw new Error(`Error al obtener marcadores: ${error.message}`);
    }
}

/**
 * Obtiene un marcador por ID
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} bookmarkId - ID del marcador
 * @returns {Promise<Object>} Objeto bookmark
 */
async function getBookmarkById(db, bookmarkId) {
    try {
        const bookmark = await db.get(
            `SELECT * FROM Marcadores WHERE id = ?`,
            [bookmarkId]
        );
        return bookmark;
    } catch (error) {
        throw new Error(`Error al obtener marcador: ${error.message}`);
    }
}

/**
 * Crea un nuevo marcador
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {Object} bookmarkData - Datos del marcador
 * @returns {Promise<Object>} Marcador creado
 */
async function createBookmark(db, bookmarkData) {
    try {
        const { usuario_id, titulo, url, descripcion, categoria_id, portada } = bookmarkData;
        
        const result = await db.run(
            `INSERT INTO Marcadores (usuario_id, titulo, url, descripcion, categoria_id, portada, fecha_creacion)
             VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
            [usuario_id, titulo, url, descripcion, categoria_id, portada]
        );

        return { id: result.lastID, ...bookmarkData };
    } catch (error) {
        throw new Error(`Error al crear marcador: ${error.message}`);
    }
}

/**
 * Actualiza un marcador
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} bookmarkId - ID del marcador
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Resultado
 */
async function updateBookmark(db, bookmarkId, updateData) {
    try {
        const fields = Object.keys(updateData)
            .map(key => `${key} = ?`)
            .join(', ');
        
        const values = [...Object.values(updateData), bookmarkId];

        const result = await db.run(
            `UPDATE Marcadores SET ${fields} WHERE id = ?`,
            values
        );

        return result;
    } catch (error) {
        throw new Error(`Error al actualizar marcador: ${error.message}`);
    }
}

/**
 * Elimina un marcador
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} bookmarkId - ID del marcador
 * @returns {Promise<Object>} Resultado
 */
async function deleteBookmark(db, bookmarkId) {
    try {
        // Eliminar tags asociados primero
        await db.run(
            `DELETE FROM Marcadores_Tags WHERE marcador_id = ?`,
            [bookmarkId]
        );

        // Eliminar marcador
        const result = await db.run(
            `DELETE FROM Marcadores WHERE id = ?`,
            [bookmarkId]
        );

        return result;
    } catch (error) {
        throw new Error(`Error al eliminar marcador: ${error.message}`);
    }
}

/**
 * Obtiene tags de un marcador
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} bookmarkId - ID del marcador
 * @returns {Promise<Array>} Array de tags
 */
async function getTagsByBookmark(db, bookmarkId) {
    try {
        const tags = await db.all(
            `SELECT t.id, t.nombre, t.color FROM Tags t
             INNER JOIN Marcadores_Tags mt ON t.id = mt.tag_id
             WHERE mt.marcador_id = ?`,
            [bookmarkId]
        );
        return tags;
    } catch (error) {
        throw new Error(`Error al obtener tags: ${error.message}`);
    }
}

/**
 * Agrega tags a un marcador
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} bookmarkId - ID del marcador
 * @param {Array<number>} tagIds - Array de IDs de tags
 * @returns {Promise<void>}
 */
async function addTagsToBookmark(db, bookmarkId, tagIds) {
    try {
        for (let tagId of tagIds) {
            await db.run(
                `INSERT OR IGNORE INTO Marcadores_Tags (marcador_id, tag_id) VALUES (?, ?)`,
                [bookmarkId, tagId]
            );
        }
    } catch (error) {
        throw new Error(`Error al agregar tags: ${error.message}`);
    }
}

/**
 * Obtiene marcadores visitados en última semana
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Array>} Array de bookmarks
 */
async function getBookmarksVisitedLastWeek(db, usuarioId) {
    try {
        const bookmarks = await db.all(
            `SELECT * FROM Marcadores 
             WHERE usuario_id = ? 
             AND ultima_apertura >= datetime('now', '-7 days')
             ORDER BY ultima_apertura DESC`,
            [usuarioId]
        );
        return bookmarks;
    } catch (error) {
        throw new Error(`Error al obtener marcadores visitados: ${error.message}`);
    }
}

/**
 * Actualiza datos de GitHub de un marcador
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} bookmarkId - ID del marcador
 * @param {Object} gitHubData - Datos de GitHub
 * @returns {Promise<void>}
 */
async function updateGitHubData(db, bookmarkId, gitHubData) {
    try {
        const { stars, forks, watchers, languages } = gitHubData;
        
        await db.run(
            `UPDATE Marcadores 
             SET github_stars = ?, github_forks = ?, github_watchers = ?, github_languages = ?
             WHERE id = ?`,
            [stars, forks, watchers, JSON.stringify(languages), bookmarkId]
        );
    } catch (error) {
        throw new Error(`Error al actualizar datos de GitHub: ${error.message}`);
    }
}

/**
 * Registra acceso a un marcador
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} bookmarkId - ID del marcador
 * @returns {Promise<void>}
 */
async function recordAccess(db, bookmarkId) {
    try {
        await db.run(
            `UPDATE Marcadores SET ultima_apertura = datetime('now') WHERE id = ?`,
            [bookmarkId]
        );
    } catch (error) {
        throw new Error(`Error al registrar acceso: ${error.message}`);
    }
}

/**
 * Obtiene estadísticas de marcadores
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Object>} Estadísticas
 */
async function getStats(db, usuarioId) {
    try {
        const total = await db.get(
            `SELECT COUNT(*) as count FROM Marcadores WHERE usuario_id = ?`,
            [usuarioId]
        );

        const thisWeek = await db.get(
            `SELECT COUNT(*) as count FROM Marcadores 
             WHERE usuario_id = ? AND ultima_apertura >= datetime('now', '-7 days')`,
            [usuarioId]
        );

        return {
            total: total?.count || 0,
            thisWeek: thisWeek?.count || 0
        };
    } catch (error) {
        throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
}

module.exports = {
    getBookmarks,
    getBookmarkById,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    getTagsByBookmark,
    addTagsToBookmark,
    getBookmarksVisitedLastWeek,
    updateGitHubData,
    recordAccess,
    getStats
};


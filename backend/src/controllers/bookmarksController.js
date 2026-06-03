/**
 * @fileoverview Controlador para gestionar todas las operaciones de Marcadores (Bookmarks)
 * Incluye CRUD completo, filtrado, búsqueda y gestión de tags para marcadores
 * @module controllers/bookmarksController
 */

/**
 * Obtiene todos los marcadores con filtros opcionales (categoría, tags, búsqueda)
 * @async
 * @function getAllBookmarks
 * @param {Object} db - Instancia de la base de datos SQLite
 * @param {Object} [filters={}] - Filtros opcionales
 * @param {number} [filters.categoria_id] - ID de categoría para filtrar
 * @param {number} [filters.tag_id] - ID de tag para filtrar
 * @param {string} [filters.search] - Término de búsqueda (título, descripción, tags)
 * @param {number} [filters.limit] - Límite de resultados
 * @param {number} [filters.offset] - Offset para paginación
 * @returns {Promise<Array>} Array de bookmarks con tags incluidos
 * @throws {Error} Si hay error al consultar la base de datos
 */
async function getAllBookmarks(db, filters = {}) {
    try {
        let query = `
            SELECT DISTINCT m.id, m.titulo, m.url, m.descripcion, m.portada, 
                   m.categoria_id, m.fecha_creacion, m.ultima_apertura,
                   m.github_stars, m.github_forks, m.github_watchers, m.github_languages,
                   m.url_estado, m.ultima_verificacion
            FROM Marcadores m
            LEFT JOIN Marcadores_Tags mt ON m.id = mt.marcador_id
            LEFT JOIN Tags t ON mt.tag_id = t.id
            WHERE 1=1
        `;
        const params = [];

        // Filtrar por categoría
        if (filters.categoria_id) {
            query += ` AND m.categoria_id = ?`;
            params.push(filters.categoria_id);
        } else {
            // Si NO hay filtro de categoría, mostrar solo marcadores sin categoría (sección general)
            query += ` AND m.categoria_id IS NULL`;
        }

        // Filtrar por tag
        if (filters.tag_id) {
            query += ` AND mt.tag_id = ?`;
            params.push(filters.tag_id);
        }

        // Filtrar por búsqueda (título, descripción o tags)
        if (filters.search) {
            query += ` AND (m.titulo LIKE ? OR m.descripcion LIKE ? OR t.nombre LIKE ?)`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ` ORDER BY m.fecha_creacion DESC`;

        // Aplicar límite y offset para paginación
        if (filters.limit) {
            query += ` LIMIT ?`;
            params.push(filters.limit);
            if (filters.offset) {
                query += ` OFFSET ?`;
                params.push(filters.offset);
            }
        }

        const bookmarks = await db.all(query, params);

        // Obtener tags para cada marcador y parsear github_languages
        for (let bookmark of bookmarks) {
            bookmark.tags = await getTagsByBookmark(db, bookmark.id);
            // Parsear github_languages de JSON string a array
            if (bookmark.github_languages) {
                try {
                    bookmark.github_languages = JSON.parse(bookmark.github_languages);
                } catch (e) {
                    bookmark.github_languages = [];
                }
            }
        }

        return bookmarks;
    } catch (error) {
        throw new Error(`Error al obtener marcadores: ${error.message}`);
    }
}

/**
 * Obtiene un marcador específico por su ID
 * @async
 * @function getBookmarkById
 * @param {Object} db - Instancia de la base de datos SQLite
 * @param {number} id - ID del marcador
 * @returns {Promise<Object>} Objeto marcador con tags y metadatos GitHub
 * @throws {Error} Si el marcador no existe o hay error en la consulta
 */
async function getBookmarkById(db, id) {
    try {
        const bookmark = await db.get(`
            SELECT m.id, m.titulo, m.url, m.descripcion, m.portada, 
                   m.categoria_id, m.fecha_creacion, m.ultima_apertura,
                   m.github_stars, m.github_forks, m.github_watchers, m.github_languages,
                   m.url_estado, m.ultima_verificacion
            FROM Marcadores m
            WHERE m.id = ?
        `, [id]);

        if (!bookmark) {
            return null;
        }

        bookmark.tags = await getTagsByBookmark(db, id);
        
        // Parsear github_languages de JSON string a array
        if (bookmark.github_languages) {
            try {
                bookmark.github_languages = JSON.parse(bookmark.github_languages);
            } catch (e) {
                bookmark.github_languages = [];
            }
        }
        
        return bookmark;
    } catch (error) {
        throw new Error(`Error al obtener marcador: ${error.message}`);
    }
}

// Crear un nuevo marcador
async function createBookmark(db, { titulo, url, descripcion, portada, categoria_id, tags = [], github_stars = 0, github_forks = 0, github_watchers = 0, github_languages = [] }) {
    try {
        if (!titulo || titulo.trim() === '') {
            throw new Error('El título es requerido');
        }

        if (!url || url.trim() === '') {
            throw new Error('La URL es requerida');
        }

        // Validar formato de URL
        try {
            new URL(url);
        } catch {
            throw new Error('La URL proporcionada no es válida');
        }

        // Si se proporciona categoria_id, validar que exista
        if (categoria_id) {
            const categoria = await db.get(`SELECT id FROM Categorias WHERE id = ?`, [categoria_id]);
            if (!categoria) {
                throw new Error('La categoría especificada no existe');
            }
        }

        // Procesar portada - puede ser base64 string, buffer, o null
        let portadaBase64 = null;
        if (portada) {
            if (Buffer.isBuffer(portada)) {
                portadaBase64 = portada.toString('base64');
            } else if (typeof portada === 'string' && portada.startsWith('data:')) {
                // Si ya es un data URI, extraer solo la parte base64
                portadaBase64 = portada.split(',')[1];
            } else if (typeof portada === 'string') {
                // Si es string pero no es data URI, es posiblemente base64 ya
                portadaBase64 = portada;
            }
        }

        // Procesar github_languages - convertir a JSON string
        let githubLanguagesJson = null;
        if (github_languages && github_languages.length > 0) {
            githubLanguagesJson = JSON.stringify(github_languages);
        }

        // Insertar el marcador
        const resultado = await db.run(`
            INSERT INTO Marcadores (titulo, url, descripcion, portada, categoria_id, fecha_creacion, github_stars, github_forks, github_watchers, github_languages)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)
        `, [titulo.trim(), url.trim(), descripcion || null, portadaBase64, categoria_id || null, github_stars, github_forks, github_watchers, githubLanguagesJson]);

        const bookmarkId = resultado.lastID;

        // Agregar tags si se proporcionan
        if (tags && tags.length > 0) {
            for (let tagId of tags) {
                // Validar que el tag existe
                const tag = await db.get(`SELECT id FROM Tags WHERE id = ?`, [tagId]);
                if (!tag) {
                    throw new Error(`El tag con ID ${tagId} no existe`);
                }

                await db.run(`
                    INSERT INTO Marcadores_Tags (marcador_id, tag_id)
                    VALUES (?, ?)
                `, [bookmarkId, tagId]);
            }
        }

        return getBookmarkById(db, bookmarkId);
    } catch (error) {
        throw new Error(`Error al crear marcador: ${error.message}`);
    }
}

// Actualizar un marcador
async function updateBookmark(db, id, { titulo, url, descripcion, portada, categoria_id, tags, github_stars, github_forks, github_watchers, github_languages }) {
    try {
        const bookmark = await db.get(`SELECT * FROM Marcadores WHERE id = ?`, [id]);
        if (!bookmark) {
            throw new Error('Marcador no encontrado');
        }

        if (url) {
            try {
                new URL(url);
            } catch {
                throw new Error('La URL proporcionada no es válida');
            }
        }

        if (categoria_id !== undefined) {
            if (categoria_id !== null) {
                const categoria = await db.get(`SELECT id FROM Categorias WHERE id = ?`, [categoria_id]);
                if (!categoria) {
                    throw new Error('La categoría especificada no existe');
                }
            }
        }

        // Procesar portada - puede ser base64 string, buffer, undefined, null, o string vacía
        let portadaFinal;
        if (portada !== undefined) {
            if (portada === null || portada === '') {
                // Eliminar portada
                portadaFinal = null;
            } else if (Buffer.isBuffer(portada)) {
                portadaFinal = portada.toString('base64');
            } else if (typeof portada === 'string' && portada.startsWith('data:')) {
                // Si es un data URI, extraer solo la parte base64
                portadaFinal = portada.split(',')[1];
            } else if (typeof portada === 'string') {
                // Si es string, usarlo como está (ya es base64)
                portadaFinal = portada;
            } else {
                portadaFinal = bookmark.portada;
            }
        } else {
            portadaFinal = bookmark.portada;
        }

        // Procesar github_languages
        let githubLanguagesJson = bookmark.github_languages;
        if (github_languages !== undefined) {
            if (github_languages && github_languages.length > 0) {
                githubLanguagesJson = JSON.stringify(github_languages);
            } else {
                githubLanguagesJson = null;
            }
        }

        await db.run(`
            UPDATE Marcadores 
            SET titulo = ?, url = ?, descripcion = ?, portada = ?, categoria_id = ?, github_stars = ?, github_forks = ?, github_watchers = ?, github_languages = ?
            WHERE id = ?
        `, [
            titulo || bookmark.titulo,
            url || bookmark.url,
            descripcion !== undefined ? descripcion : bookmark.descripcion,
            portadaFinal,
            categoria_id !== undefined ? categoria_id : bookmark.categoria_id,
            github_stars !== undefined ? github_stars : bookmark.github_stars,
            github_forks !== undefined ? github_forks : bookmark.github_forks,
            github_watchers !== undefined ? github_watchers : bookmark.github_watchers,
            githubLanguagesJson,
            id
        ]);

        // Si se proporcionan tags, actualizar
        if (tags) {
            // Eliminar tags existentes
            await db.run(`DELETE FROM Marcadores_Tags WHERE marcador_id = ?`, [id]);

            // Agregar nuevos tags
            for (let tagId of tags) {
                const tag = await db.get(`SELECT id FROM Tags WHERE id = ?`, [tagId]);
                if (!tag) {
                    throw new Error(`El tag con ID ${tagId} no existe`);
                }

                await db.run(`
                    INSERT INTO Marcadores_Tags (marcador_id, tag_id)
                    VALUES (?, ?)
                `, [id, tagId]);
            }
        }

        return getBookmarkById(db, id);
    } catch (error) {
        throw new Error(`Error al actualizar marcador: ${error.message}`);
    }
}

// Eliminar un marcador
async function deleteBookmark(db, id) {
    try {
        const bookmark = await db.get(`SELECT * FROM Marcadores WHERE id = ?`, [id]);
        if (!bookmark) {
            throw new Error('Marcador no encontrado');
        }

        // Eliminar los tags asociados
        await db.run(`DELETE FROM Marcadores_Tags WHERE marcador_id = ?`, [id]);

        // Eliminar el marcador
        await db.run(`DELETE FROM Marcadores WHERE id = ?`, [id]);

        return { mensaje: 'Marcador eliminado exitosamente' };
    } catch (error) {
        throw new Error(`Error al eliminar marcador: ${error.message}`);
    }
}

// Obtener tags de un marcador
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

// Agregar tags a un marcador
async function addTagsToBookmark(db, bookmarkId, tagIds) {
    try {
        const bookmark = await db.get(`SELECT id FROM Marcadores WHERE id = ?`, [bookmarkId]);
        if (!bookmark) {
            throw new Error('Marcador no encontrado');
        }

        for (let tagId of tagIds) {
            const tag = await db.get(`SELECT id FROM Tags WHERE id = ?`, [tagId]);
            if (!tag) {
                throw new Error(`El tag con ID ${tagId} no existe`);
            }

            // Verificar que no esté ya agregado
            const existe = await db.get(`
                SELECT * FROM Marcadores_Tags WHERE marcador_id = ? AND tag_id = ?
            `, [bookmarkId, tagId]);

            if (!existe) {
                await db.run(`
                    INSERT INTO Marcadores_Tags (marcador_id, tag_id)
                    VALUES (?, ?)
                `, [bookmarkId, tagId]);
            }
        }

        return getTagsByBookmark(db, bookmarkId);
    } catch (error) {
        throw new Error(`Error al agregar tags: ${error.message}`);
    }
}

// Remover un tag de un marcador
async function removeTagFromBookmark(db, bookmarkId, tagId) {
    try {
        const bookmark = await db.get(`SELECT id FROM Marcadores WHERE id = ?`, [bookmarkId]);
        if (!bookmark) {
            throw new Error('Marcador no encontrado');
        }

        const tag = await db.get(`SELECT id FROM Tags WHERE id = ?`, [tagId]);
        if (!tag) {
            throw new Error('Tag no encontrado');
        }

        await db.run(`
            DELETE FROM Marcadores_Tags WHERE marcador_id = ? AND tag_id = ?
        `, [bookmarkId, tagId]);

        return { mensaje: 'Tag removido exitosamente' };
    } catch (error) {
        throw new Error(`Error al remover tag: ${error.message}`);
    }
}

// Obtener marcadores por tag
async function getBookmarksByTag(db, tagId, filters = {}) {
    try {
        let query = `
            SELECT DISTINCT m.id, m.titulo, m.url, m.descripcion, m.portada, 
                   m.categoria_id, m.fecha_creacion, m.ultima_apertura,
                   m.github_stars, m.github_forks, m.github_watchers, m.github_languages,
                   m.url_estado, m.ultima_verificacion
            FROM Marcadores m
            INNER JOIN Marcadores_Tags mt ON m.id = mt.marcador_id
            WHERE mt.tag_id = ?
        `;
        const params = [tagId];

        // Aplicar filtros adicionales
        if (filters.search) {
            query += ` AND (m.titulo LIKE ? OR m.descripcion LIKE ?)`;
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }

        query += ` ORDER BY m.fecha_creacion DESC`;

        if (filters.limit) {
            query += ` LIMIT ?`;
            params.push(filters.limit);
            if (filters.offset) {
                query += ` OFFSET ?`;
                params.push(filters.offset);
            }
        }

        const bookmarks = await db.all(query, params);

        for (let bookmark of bookmarks) {
            bookmark.tags = await getTagsByBookmark(db, bookmark.id);
        }

        return bookmarks;
    } catch (error) {
        throw new Error(`Error al obtener marcadores por tag: ${error.message}`);
    }
}

// Registrar la apertura de un marcador (actualiza ultima_apertura)
async function recordBookmarkAccess(db, bookmarkId) {
    try {
        const bookmark = await db.get(`SELECT id FROM Marcadores WHERE id = ?`, [bookmarkId]);
        if (!bookmark) {
            throw new Error('Marcador no encontrado');
        }

        await db.run(`
            UPDATE Marcadores 
            SET ultima_apertura = CURRENT_TIMESTAMP
            WHERE id = ?
        `, [bookmarkId]);

        return getBookmarkById(db, bookmarkId);
    } catch (error) {
        throw new Error(`Error al registrar acceso al marcador: ${error.message}`);
    }
}

// Obtener los últimos 10 marcadores más recientemente abiertos (o creados si no han sido abiertos)
// Solo devuelve marcadores de la sección general (sin carpeta padre)
async function getRecentBookmarks(db) {
    try {
        const bookmarks = await db.all(`
            SELECT m.id, m.titulo, m.url, m.descripcion, m.portada, 
                   m.categoria_id, m.fecha_creacion, m.ultima_apertura,
                   m.github_stars, m.github_forks, m.github_watchers, m.github_languages,
                   m.url_estado, m.ultima_verificacion
            FROM Marcadores m
            WHERE m.categoria_id IS NULL
            ORDER BY COALESCE(m.ultima_apertura, m.fecha_creacion) DESC
            LIMIT 10
        `);

        for (let bookmark of bookmarks) {
            bookmark.tags = await getTagsByBookmark(db, bookmark.id);
            // Parsear github_languages de JSON string a array
            if (bookmark.github_languages) {
                try {
                    bookmark.github_languages = JSON.parse(bookmark.github_languages);
                } catch (e) {
                    bookmark.github_languages = [];
                }
            }
        }

        return bookmarks;
    } catch (error) {
        throw new Error(`Error al obtener marcadores recientes: ${error.message}`);
    }
}

// Obtener marcadores visitados en la última semana
async function getBookmarksVisitedLastWeek(db) {
    try {
        const bookmarks = await db.all(`
            SELECT m.id, m.titulo, m.url, m.descripcion, m.portada, 
                   m.categoria_id, m.fecha_creacion, m.ultima_apertura,
                   m.url_estado, m.ultima_verificacion
            FROM Marcadores m
            WHERE m.ultima_apertura IS NOT NULL
            AND m.ultima_apertura >= datetime('now', '-7 days')
            ORDER BY m.ultima_apertura DESC
        `);

        for (let bookmark of bookmarks) {
            bookmark.tags = await getTagsByBookmark(db, bookmark.id);
        }

        return bookmarks;
    } catch (error) {
        throw new Error(`Error al obtener marcadores visitados la última semana: ${error.message}`);
    }
}

// Contar todos los marcadores (incluyendo los de carpetas)
async function countAllBookmarks(db) {
    try {
        const result = await db.get(`
            SELECT COUNT(*) as count
            FROM Marcadores
        `);

        return result.count || 0;
    } catch (error) {
        throw new Error(`Error al contar todos los marcadores: ${error.message}`);
    }
}

// Contar marcadores visitados en la última semana
async function countBookmarksVisitedLastWeek(db) {
    try {
        const result = await db.get(`
            SELECT COUNT(*) as count
            FROM Marcadores m
            WHERE m.ultima_apertura IS NOT NULL
            AND m.ultima_apertura >= datetime('now', '-7 days')
        `);

        return result.count || 0;
    } catch (error) {
        throw new Error(`Error al contar marcadores visitados: ${error.message}`);
    }
}

module.exports = {
    getAllBookmarks,
    getBookmarkById,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    getTagsByBookmark,
    addTagsToBookmark,
    removeTagFromBookmark,
    getBookmarksByTag,
    recordBookmarkAccess,
    getRecentBookmarks,
    getBookmarksVisitedLastWeek,
    countAllBookmarks,
    countBookmarksVisitedLastWeek
};


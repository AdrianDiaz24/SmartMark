// Controlador para gestionar todas las operaciones de Marcadores (Bookmarks)

// Obtener todos los marcadores con filtros opcionales
async function getAllBookmarks(db, filters = {}) {
    try {
        let query = `
            SELECT DISTINCT m.id, m.titulo, m.url, m.descripcion, m.portada, 
                   m.categoria_id, m.fecha_creacion, m.ultima_apertura
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

        // Obtener tags para cada marcador
        for (let bookmark of bookmarks) {
            bookmark.tags = await getTagsByBookmark(db, bookmark.id);
        }

        return bookmarks;
    } catch (error) {
        throw new Error(`Error al obtener marcadores: ${error.message}`);
    }
}

// Obtener un marcador específico por ID
async function getBookmarkById(db, id) {
    try {
        const bookmark = await db.get(`
            SELECT m.id, m.titulo, m.url, m.descripcion, m.portada, 
                   m.categoria_id, m.fecha_creacion, m.ultima_apertura
            FROM Marcadores m
            WHERE m.id = ?
        `, [id]);

        if (!bookmark) {
            return null;
        }

        bookmark.tags = await getTagsByBookmark(db, id);
        return bookmark;
    } catch (error) {
        throw new Error(`Error al obtener marcador: ${error.message}`);
    }
}

// Crear un nuevo marcador
async function createBookmark(db, { titulo, url, descripcion, portada, categoria_id, tags = [] }) {
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

        // Insertar el marcador
        const resultado = await db.run(`
            INSERT INTO Marcadores (titulo, url, descripcion, portada, categoria_id, fecha_creacion)
            VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `, [titulo.trim(), url.trim(), descripcion || null, portadaBase64, categoria_id || null]);

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
async function updateBookmark(db, id, { titulo, url, descripcion, portada, categoria_id, tags }) {
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

        await db.run(`
            UPDATE Marcadores 
            SET titulo = ?, url = ?, descripcion = ?, portada = ?, categoria_id = ?
            WHERE id = ?
        `, [
            titulo || bookmark.titulo,
            url || bookmark.url,
            descripcion !== undefined ? descripcion : bookmark.descripcion,
            portadaFinal,
            categoria_id !== undefined ? categoria_id : bookmark.categoria_id,
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
                   m.categoria_id, m.fecha_creacion, m.ultima_apertura
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

// Obtener marcadores visitados en la última semana
async function getBookmarksVisitedLastWeek(db) {
    try {
        const bookmarks = await db.all(`
            SELECT m.id, m.titulo, m.url, m.descripcion, m.portada, 
                   m.categoria_id, m.fecha_creacion, m.ultima_apertura
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
    getBookmarksVisitedLastWeek,
    countBookmarksVisitedLastWeek
};


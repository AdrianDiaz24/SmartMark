/**
 * @fileoverview Servicio de Bookmarks - Lógica de negocio
 * @module services/bookmarkService
 */

const bookmarksRepository = require('../repositories/bookmarksRepository');
const { scrapeUrl, autotagBookmark, getGitHubRepoData, getGitHubLanguages } = require('../controllers/scrapingController');

/**
 * Realiza scraping de una URL, autotagging y extrae datos de GitHub
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {string} url - URL para scrapear
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Object>} Datos scrapeados con tags automáticos
 */
async function scrapeAndAutoTag(db, url, usuarioId) {
    try {
        // 1. Hacer scraping de la URL
        const scrapedData = await scrapeUrl(url);
        
        if (!scrapedData.success) {
            return scrapedData;
        }

        // 2. Autotagging
        let autoTags = await autotagBookmark(db, scrapedData.titulo, scrapedData.descripcion, url, usuarioId);

        // 3. Si es GitHub, obtener datos del repositorio
        let gitHubData = null;
        if (url.includes('github.com')) {
            gitHubData = await getGitHubRepoData(url);
            const gitHubLanguages = await getGitHubLanguages(url);

            if (gitHubData) {
                scrapedData.gitHubData = gitHubData;
                scrapedData.gitHubLanguages = gitHubLanguages;

                // Agregar lenguajes como tags automáticos
                for (let language of gitHubLanguages) {
                    const tagForLanguage = await db.get(
                        'SELECT id FROM Tags WHERE LOWER(nombre) = LOWER(?) AND usuario_id = ?',
                        [language, usuarioId]
                    );
                    if (tagForLanguage) {
                        autoTags.push(tagForLanguage.id);
                    }
                }

                // Eliminar duplicados
                autoTags = [...new Set(autoTags)];
            }
        }

        scrapedData.autoTags = autoTags;
        return scrapedData;
    } catch (error) {
        console.error('Error en scrapeAndAutoTag:', error);
        throw error;
    }
}

/**
 * Obtiene bookmarks con filtros
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} usuarioId - ID del usuario
 * @param {Object} filters - Filtros
 * @returns {Promise<Array>} Array de bookmarks con tags
 */
async function getBookmarksWithTags(db, usuarioId, filters = {}) {
    try {
        const bookmarks = await bookmarksRepository.getBookmarks(db, usuarioId, filters);

        // Agregar tags e parsear github_languages
        for (let bookmark of bookmarks) {
            bookmark.tags = await bookmarksRepository.getTagsByBookmark(db, bookmark.id);
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
        console.error('Error en getBookmarksWithTags:', error);
        throw error;
    }
}

/**
 * Crea un nuevo bookmark
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} usuarioId - ID del usuario
 * @param {Object} bookmarkData - Datos del bookmark
 * @returns {Promise<Object>} Bookmark creado
 */
async function createBookmarkWithTags(db, usuarioId, bookmarkData) {
    try {
        const { titulo, url, descripcion, categoria_id, portada, tag_ids } = bookmarkData;

        // Crear bookmark
        const bookmark = await bookmarksRepository.createBookmark(db, {
            usuario_id: usuarioId,
            titulo,
            url,
            descripcion,
            categoria_id,
            portada
        });

        // Agregar tags si existen
        if (tag_ids && tag_ids.length > 0) {
            await bookmarksRepository.addTagsToBookmark(db, bookmark.id, tag_ids);
            bookmark.tags = await bookmarksRepository.getTagsByBookmark(db, bookmark.id);
        } else {
            bookmark.tags = [];
        }

        return bookmark;
    } catch (error) {
        console.error('Error en createBookmarkWithTags:', error);
        throw error;
    }
}

/**
 * Actualiza un bookmark
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} bookmarkId - ID del bookmark
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} Bookmark actualizado
 */
async function updateBookmarkWithTags(db, bookmarkId, updateData) {
    try {
        const { tag_ids, ...otherData } = updateData;

        // Actualizar bookmark
        await bookmarksRepository.updateBookmark(db, bookmarkId, otherData);

        // Actualizar tags si se proporcionan
        if (tag_ids) {
            // Eliminar tags existentes
            await db.run('DELETE FROM Marcadores_Tags WHERE marcador_id = ?', [bookmarkId]);
            // Agregar nuevos tags
            if (tag_ids.length > 0) {
                await bookmarksRepository.addTagsToBookmark(db, bookmarkId, tag_ids);
            }
        }

        // Obtener datos actualizados
        const updated = await bookmarksRepository.getBookmarkById(db, bookmarkId);
        updated.tags = await bookmarksRepository.getTagsByBookmark(db, bookmarkId);
        return updated;
    } catch (error) {
        console.error('Error en updateBookmarkWithTags:', error);
        throw error;
    }
}

/**
 * Elimina un bookmark
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} bookmarkId - ID del bookmark
 * @returns {Promise<Object>} Resultado
 */
async function deleteBookmarkService(db, bookmarkId) {
    try {
        return await bookmarksRepository.deleteBookmark(db, bookmarkId);
    } catch (error) {
        console.error('Error en deleteBookmarkService:', error);
        throw error;
    }
}

/**
 * Obtiene un bookmark específico
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} bookmarkId - ID del bookmark
 * @returns {Promise<Object>} Bookmark con tags
 */
async function getBookmarkDetailService(db, bookmarkId) {
    try {
        const bookmark = await bookmarksRepository.getBookmarkById(db, bookmarkId);
        if (bookmark) {
            bookmark.tags = await bookmarksRepository.getTagsByBookmark(db, bookmarkId);
            if (bookmark.github_languages) {
                try {
                    bookmark.github_languages = JSON.parse(bookmark.github_languages);
                } catch (e) {
                    bookmark.github_languages = [];
                }
            }
        }
        return bookmark;
    } catch (error) {
        console.error('Error en getBookmarkDetailService:', error);
        throw error;
    }
}

/**
 * Registra acceso a un bookmark
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} bookmarkId - ID del bookmark
 * @returns {Promise<void>}
 */
async function recordBookmarkAccess(db, bookmarkId) {
    try {
        await bookmarksRepository.recordAccess(db, bookmarkId);
    } catch (error) {
        console.error('Error en recordBookmarkAccess:', error);
        throw error;
    }
}

/**
 * Actualiza datos de GitHub para un bookmark
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} bookmarkId - ID del bookmark
 * @param {string} url - URL del bookmark
 * @returns {Promise<Object>} Datos de GitHub obtenidos
 */
async function refreshGitHubData(db, bookmarkId, url) {
    try {
        const gitHubData = await getGitHubRepoData(url);
        if (gitHubData) {
            await bookmarksRepository.updateGitHubData(db, bookmarkId, gitHubData);
        }
        return gitHubData;
    } catch (error) {
        console.error('Error en refreshGitHubData:', error);
        throw error;
    }
}

/**
 * Obtiene conteos de bookmarks
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Object>} Estadísticas
 */
async function getBookmarkStats(db, usuarioId) {
    try {
        return await bookmarksRepository.getStats(db, usuarioId);
    } catch (error) {
        console.error('Error en getBookmarkStats:', error);
        throw error;
    }
}

/**
 * Obtiene últimos 10 bookmarks: primero visitados esta semana, luego últimos creados
 * @async
 * @param {Object} db - Instancia SQLite
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Array>} Array de hasta 10 bookmarks
 */
async function getRecentBookmarksService(db, usuarioId) {
    try {
        // 1. Obtener visitados esta semana
        const recentVisited = await bookmarksRepository.getBookmarksVisitedLastWeek(db, usuarioId);

        // Si ya tenemos 10, retornar
        if (recentVisited.length >= 10) {
            const bookmarks = recentVisited.slice(0, 10);
            for (let bookmark of bookmarks) {
                bookmark.tags = await bookmarksRepository.getTagsByBookmark(db, bookmark.id);
                if (bookmark.github_languages) {
                    try {
                        bookmark.github_languages = JSON.parse(bookmark.github_languages);
                    } catch (e) {
                        bookmark.github_languages = [];
                    }
                }
            }
            return bookmarks;
        }

        // 2. Llenar con los últimos creados hasta completar 10
        const remainingNeeded = 10 - recentVisited.length;
        let lastCreated = [];
        
        if (remainingNeeded > 0) {
            // Si hay visitados, excluirlos; si no, obtener directamente los últimos creados
            if (recentVisited.length > 0) {
                const visitedIds = recentVisited.map(b => b.id);
                const placeholders = visitedIds.map(() => '?').join(',');
                lastCreated = await db.all(
                    `SELECT * FROM Marcadores 
                     WHERE usuario_id = ? AND id NOT IN (${placeholders})
                     ORDER BY fecha_creacion DESC 
                     LIMIT ?`,
                    [usuarioId, ...visitedIds, remainingNeeded]
                );
            } else {
                // Si no hay visitados, obtener directamente los últimos creados
                lastCreated = await db.all(
                    `SELECT * FROM Marcadores 
                     WHERE usuario_id = ?
                     ORDER BY fecha_creacion DESC 
                     LIMIT ?`,
                    [usuarioId, remainingNeeded]
                );
            }
        }

        // Combinar ambos resultados
        const combined = [...recentVisited, ...lastCreated];
        for (let bookmark of combined) {
            bookmark.tags = await bookmarksRepository.getTagsByBookmark(db, bookmark.id);
            if (bookmark.github_languages) {
                try {
                    bookmark.github_languages = JSON.parse(bookmark.github_languages);
                } catch (e) {
                    bookmark.github_languages = [];
                }
            }
        }
        return combined;
    } catch (error) {
        console.error('Error en getRecentBookmarksService:', error);
        throw error;
    }
}

module.exports = {
    scrapeAndAutoTag,
    getBookmarksWithTags,
    createBookmarkWithTags,
    updateBookmarkWithTags,
    deleteBookmarkService,
    getBookmarkDetailService,
    recordBookmarkAccess,
    refreshGitHubData,
    getBookmarkStats,
    getRecentBookmarksService
};




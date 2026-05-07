// Controlador para gestionar todas las operaciones de Categorías

// Obtener todas las categorías con su estructura jerárquica
async function getAllCategories(db) {
    try {
        const categories = await db.all(`
            SELECT * FROM Categorias WHERE padre_id IS NULL
            ORDER BY fecha_creacion DESC
        `);

        // Para cada categoría padre, obtener sus subcategorías
        for (let cat of categories) {
            cat.children = await getSubcategories(db, cat.id);
            const stats = await getCategoryStats(db, cat.id);
            cat.subfolders = stats.subfolders;
            cat.bookmarks = stats.bookmarks;
            cat.tags = await getTagsByCategory(db, cat.id);
        }

        return categories;
    } catch (error) {
        throw new Error(`Error al obtener categorías: ${error.message}`);
    }
}

// Obtener subcategorías recursivamente
async function getSubcategories(db, parentId) {
    try {
        const subcats = await db.all(`
            SELECT * FROM Categorias WHERE padre_id = ?
            ORDER BY fecha_creacion DESC
        `, [parentId]);

        for (let subcat of subcats) {
            subcat.children = await getSubcategories(db, subcat.id);
            const stats = await getCategoryStats(db, subcat.id);
            subcat.subfolders = stats.subfolders;
            subcat.bookmarks = stats.bookmarks;
            subcat.tags = await getTagsByCategory(db, subcat.id);
        }

        return subcats;
    } catch (error) {
        throw new Error(`Error al obtener subcategorías: ${error.message}`);
    }
}

// Obtener estadísticas de una categoría (cantidad de subcarpetas y marcadores)
async function getCategoryStats(db, categoryId) {
    try {
        const subfolders = await db.get(`
            SELECT COUNT(*) as count FROM Categorias WHERE padre_id = ?
        `, [categoryId]);

        const bookmarks = await db.get(`
            SELECT COUNT(*) as count FROM Marcadores WHERE categoria_id = ?
        `, [categoryId]);

        return {
            subfolders: subfolders?.count || 0,
            bookmarks: bookmarks?.count || 0
        };
    } catch (error) {
        throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
}

// Obtener una categoría específica por ID
async function getCategoryById(db, id) {
    try {
        const category = await db.get(`
            SELECT * FROM Categorias WHERE id = ?
        `, [id]);

        if (!category) {
            return null;
        }

        category.children = await getSubcategories(db, id);
        const stats = await getCategoryStats(db, id);
        category.subfolders = stats.subfolders;
        category.bookmarks = stats.bookmarks;
        category.tags = await getTagsByCategory(db, id);

        return category;
    } catch (error) {
        throw new Error(`Error al obtener categoría: ${error.message}`);
    }
}

// Crear una nueva categoría
async function createCategory(db, nombre, padre_id = null, tags = []) {
    try {
        if (!nombre || nombre.trim() === '') {
            throw new Error('El nombre de la categoría es requerido');
        }

        const resultado = await db.run(`
            INSERT INTO Categorias (nombre, padre_id, fecha_creacion)
            VALUES (?, ?, CURRENT_TIMESTAMP)
        `, [nombre.trim(), padre_id || null]);

        const categoryId = resultado.lastID;

        // Agregar tags si se proporcionan
        if (tags && tags.length > 0) {
            for (let tagId of tags) {
                const tag = await db.get(`SELECT id FROM Tags WHERE id = ?`, [tagId]);
                if (tag) {
                    await db.run(`
                        INSERT INTO Categorias_Tags (categoria_id, tag_id)
                        VALUES (?, ?)
                    `, [categoryId, tagId]);
                }
            }
        }

        return {
            id: categoryId,
            nombre: nombre.trim(),
            padre_id: padre_id || null,
            fecha_creacion: new Date().toISOString(),
            children: [],
            subfolders: 0,
            bookmarks: 0,
            tags: []
        };
    } catch (error) {
        throw new Error(`Error al crear categoría: ${error.message}`);
    }
}

// Actualizar una categoría
async function updateCategory(db, id, nombre, padre_id) {
    try {
        const categoria = await db.get(`SELECT * FROM Categorias WHERE id = ?`, [id]);
        if (!categoria) {
            throw new Error('Categoría no encontrada');
        }

        if (padre_id !== undefined && padre_id !== null) {
            // Validar que no se intente hacer una categoría padre de sí misma
            if (padre_id === id) {
                throw new Error('Una categoría no puede ser padre de sí misma');
            }
            // Validar que el padre existe
            const padre = await db.get(`SELECT * FROM Categorias WHERE id = ?`, [padre_id]);
            if (!padre) {
                throw new Error('Categoría padre no encontrada');
            }
        }

        await db.run(`
            UPDATE Categorias SET nombre = ?, padre_id = ? WHERE id = ?
        `, [nombre || categoria.nombre, padre_id !== undefined ? padre_id : categoria.padre_id, id]);

        return getCategoryById(db, id);
    } catch (error) {
        throw new Error(`Error al actualizar categoría: ${error.message}`);
    }
}

// Eliminar una categoría
async function deleteCategory(db, id, deleteBookmarks = false) {
    try {
        const categoria = await db.get(`SELECT * FROM Categorias WHERE id = ?`, [id]);
        if (!categoria) {
            throw new Error('Categoría no encontrada');
        }

        if (deleteBookmarks) {
            // Eliminar todos los marcadores de esta categoría y subcategorías
            await deleteAllBookmarksInCategory(db, id);
        } else {
            // Mover los marcadores a la categoría padre
            const padre_id = categoria.padre_id || null;
            await db.run(`
                UPDATE Marcadores SET categoria_id = ? WHERE categoria_id = ?
            `, [padre_id, id]);
        }

        // Mover las subcategorías a la categoría padre
        const padre_id = categoria.padre_id || null;
        await db.run(`
            UPDATE Categorias SET padre_id = ? WHERE padre_id = ?
        `, [padre_id, id]);

        // Eliminar la categoría
        await db.run(`DELETE FROM Categorias WHERE id = ?`, [id]);

        return { mensaje: 'Categoría eliminada exitosamente' };
    } catch (error) {
        throw new Error(`Error al eliminar categoría: ${error.message}`);
    }
}

// Eliminar todos los marcadores de una categoría y subcategorías
async function deleteAllBookmarksInCategory(db, categoryId) {
    try {
        // Obtener todos los IDs de marcadores en esta categoría
        const bookmarks = await db.all(`
            SELECT id FROM Marcadores WHERE categoria_id = ?
        `, [categoryId]);

        for (let bookmark of bookmarks) {
            // Eliminar tags del marcador
            await db.run(`
                DELETE FROM Marcadores_Tags WHERE marcador_id = ?
            `, [bookmark.id]);
            // Eliminar el marcador
            await db.run(`
                DELETE FROM Marcadores WHERE id = ?
            `, [bookmark.id]);
        }

        // Recursivamente eliminar marcadores de subcategorías
        const subcategorias = await db.all(`
            SELECT id FROM Categorias WHERE padre_id = ?
        `, [categoryId]);

        for (let subcat of subcategorias) {
            await deleteAllBookmarksInCategory(db, subcat.id);
        }
    } catch (error) {
        throw new Error(`Error al eliminar marcadores: ${error.message}`);
    }
}

// Obtener tags de una categoría
async function getTagsByCategory(db, categoryId) {
    try {
        const tags = await db.all(`
            SELECT t.id, t.nombre, t.color, t.fecha_creacion
            FROM Tags t
            INNER JOIN Categorias_Tags ct ON t.id = ct.tag_id
            WHERE ct.categoria_id = ?
            ORDER BY t.fecha_creacion DESC
        `, [categoryId]);
        return tags;
    } catch (error) {
        throw new Error(`Error al obtener tags de la categoría: ${error.message}`);
    }
}

// Agregar tags a una categoría
async function addTagsToCategory(db, categoryId, tagIds) {
    try {
        const category = await db.get(`SELECT id FROM Categorias WHERE id = ?`, [categoryId]);
        if (!category) {
            throw new Error('Categoría no encontrada');
        }

        for (let tagId of tagIds) {
            const tag = await db.get(`SELECT id FROM Tags WHERE id = ?`, [tagId]);
            if (!tag) {
                throw new Error(`El tag con ID ${tagId} no existe`);
            }

            // Verificar que no esté ya agregado
            const existe = await db.get(`
                SELECT * FROM Categorias_Tags WHERE categoria_id = ? AND tag_id = ?
            `, [categoryId, tagId]);

            if (!existe) {
                await db.run(`
                    INSERT INTO Categorias_Tags (categoria_id, tag_id)
                    VALUES (?, ?)
                `, [categoryId, tagId]);
            }
        }

        return getTagsByCategory(db, categoryId);
    } catch (error) {
        throw new Error(`Error al agregar tags: ${error.message}`);
    }
}

// Remover un tag de una categoría
async function removeTagFromCategory(db, categoryId, tagId) {
    try {
        const category = await db.get(`SELECT id FROM Categorias WHERE id = ?`, [categoryId]);
        if (!category) {
            throw new Error('Categoría no encontrada');
        }

        const tag = await db.get(`SELECT id FROM Tags WHERE id = ?`, [tagId]);
        if (!tag) {
            throw new Error('Tag no encontrado');
        }

        await db.run(`
            DELETE FROM Categorias_Tags WHERE categoria_id = ? AND tag_id = ?
        `, [categoryId, tagId]);

        return { mensaje: 'Tag removido exitosamente' };
    } catch (error) {
        throw new Error(`Error al remover tag: ${error.message}`);
    }
}

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    getSubcategories,
    getCategoryStats,
    getTagsByCategory,
    addTagsToCategory,
    removeTagFromCategory
};


/**
 * @fileoverview Utilidades de autenticación para controladores
 * @module utils/authUtils
 */

/**
 * Verifica que el recurso (bookmark, categoría, tag) pertenezca al usuario
 * @param {Object} db - Instancia de la base de datos
 * @param {string} tabla - Nombre de la tabla (Marcadores, Categorias, Tags)
 * @param {number} recursoId - ID del recurso
 * @param {number} usuarioId - ID del usuario propietario
 * @returns {Promise<boolean>} True si el recurso pertenece al usuario
 */
async function verificarPropiedad(db, tabla, recursoId, usuarioId) {
    try {
        const recurso = await db.get(
            `SELECT id FROM ${tabla} WHERE id = ? AND usuario_id = ?`,
            [recursoId, usuarioId]
        );
        return !!recurso;
    } catch (error) {
        console.error(`Error verificando propiedad en ${tabla}:`, error);
        return false;
    }
}

/**
 * Agrega filtro de usuario_id automáticamente a una query WHERE
 * @param {string} query - Query SQL sin filtro de usuario
 * @param {string} tablaAlias - Alias de la tabla principal (ej: 'm' para Marcadores m)
 * @param {number} usuarioId - ID del usuario
 * @returns {Object} {query: string actualizado, params: [usuarioId]}
 */
function agregarFiltroUsuario(query, tablaAlias, usuarioId) {
    const newQuery = query.replace(
        'WHERE',
        `WHERE ${tablaAlias}.usuario_id = ? AND`
    );
    return {
        query: newQuery,
        params: [usuarioId]
    };
}

module.exports = {
    verificarPropiedad,
    agregarFiltroUsuario
};


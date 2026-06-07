const axios = require('axios');

/**
 * @fileoverview Servicio de verificación de URLs para SmartMark
 * Verifica el estado de todos los marcadores usando HTTP HEAD/GET
 * @module services/urlVerificationService
 */

/** @constant {number} VERIFICATION_TIMEOUT - Timeout máximo para una verificación (5 segundos por defecto) */
const VERIFICATION_TIMEOUT = process.env.HTTP_TIMEOUT ? parseInt(process.env.HTTP_TIMEOUT) : 5000;

/**
 * Verifica si una URL es accesible y válida
 * Intenta primero con HEAD request (más rápido), si falla intenta GET
 * 
 * @async
 * @function verifyUrl
 * @param {string} url - URL a verificar
 * @returns {Promise<string>} 'valida' si la URL es accesible, 'invalida' si no
 * 
 * @description
 * Proceso de verificación:
 * 1. Intenta HEAD request (rápido, sin descargar contenido)
 * 2. Si falla, intenta GET request
 * 3. Retorna 'valida' si código HTTP < 400
 * 4. Retorna 'invalida' si código >= 400 o timeout
 * 
 * @example
 * const estado = await verifyUrl('https://example.com');
 * // Retorna: 'valida' o 'invalida'
 */
async function verifyUrl(url) {
    try {
        // Validar que URL es un string válido
        if (!url || typeof url !== 'string') {
            console.warn(`URL inválida (no es string): ${url}`);
            return 'invalida';
        }

        // Primero intentar con HEAD (más rápido)
        try {
            const response = await axios.head(url, {
                timeout: VERIFICATION_TIMEOUT,
                maxRedirects: 5,
                validateStatus: () => true // Aceptar cualquier código de estado
            });

            // Si obtenemos un código 2xx o 3xx, la URL es válida
            if (response.status < 400) {
                return 'valida';
            }
            // Si es 4xx o 5xx, pasar al GET
        } catch (headError) {
            // Si HEAD falla, intentar con GET
            try {
                const response = await axios.get(url, {
                    timeout: VERIFICATION_TIMEOUT,
                    maxRedirects: 5,
                    validateStatus: () => true
                });

                // Si GET devuelve status < 400, es válida
                if (response.status < 400) {
                    return 'valida';
                }
                // Si es 4xx o 5xx, continuamos para retornar inválida
            } catch (getError) {
                // Si GET falla completamente, es inválida
                return 'invalida';
            }
        }

        // Si llegamos aquí, significa que HEAD tuvo status >= 400
        // o GET tuvo status >= 400, así que es inválida
        return 'invalida';
    } catch (error) {
        console.warn(`Error ao verificar URL ${url}: ${error.message}`);
        return 'invalida';
    }
}

/**
 * Verifica el estado de todas las URLs en la base de datos
 * Se ejecuta cada 7 días o cuando se inicia el servidor
 * Actualiza el campo url_estado en cada marcador
 * 
 * @async
 * @function verifyAllBookmarks
 * @param {Object} db - Instancia de la base de datos SQLite
 * @returns {Promise<Object>} Estadísticas: { total: number, validos: number, invalidos: number }
 * 
 * @description
 * Procesa cada marcador y:
 * 1. Verifica su URL
 * 2. Actualiza url_estado ('valida' o 'invalida')
 * 3. Recuenta estadísticas generales
 * 4. Muestra progreso en consola
 * 
 * @example
 * const result = await verifyAllBookmarks(db);
 * // Retorna: { total: 50, validos: 45, invalidos: 5 }
 */
async function verifyAllBookmarks(db) {
    try {
        console.log(' Iniciando verificación semanal de URLs...');
        
        // Obtener todos los marcadores
        const bookmarks = await db.all(`
            SELECT id, url
            FROM Marcadores
        `);

        console.log(` Verificando ${bookmarks.length} marcadores...`);

        let contador = 0;
        let validos = 0;
        let invalidos = 0;

        for (let bookmark of bookmarks) {
            try {
                const estado = await verifyUrl(bookmark.url);
                
                // Actualizar el estado en la BD
                await db.run(`
                    UPDATE Marcadores 
                    SET url_estado = ?, ultima_verificacion = CURRENT_TIMESTAMP
                    WHERE id = ?
                `, [estado, bookmark.id]);

                contador++;
                if (estado === 'valida') {
                    validos++;
                } else {
                    invalidos++;
                }

                // Log cada 10 marcadores
                if (contador % 10 === 0) {
                    console.log(`Verificados ${contador} de ${bookmarks.length} marcadores...`);
                }
            } catch (error) {
                console.error(`Error verificando marcador ${bookmark.id}:`, error.message);
            }
        }

        console.log(`Verificación completada. ${contador} marcadores procesados.`);
        return { total: bookmarks.length, validos, invalidos };
    } catch (error) {
        console.error('Error en verificación de URLs:', error.message);
        throw error;
    }
}

// Función para obtener el estado de una URL específica
async function getBookmarkUrlStatus(db, bookmarkId) {
    try {
        const result = await db.get(`
            SELECT url_estado, ultima_verificacion
            FROM Marcadores
            WHERE id = ?
        `, [bookmarkId]);

        return result || null;
    } catch (error) {
        console.error(`Error obteniendo estado de URL para marcador ${bookmarkId}:`, error.message);
        return null;
    }
}

module.exports = {
    verifyUrl,
    verifyAllBookmarks,
    getBookmarkUrlStatus
};

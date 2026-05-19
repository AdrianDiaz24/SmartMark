const axios = require('axios');

// Timeout para verificaciones de URL (en ms)
const VERIFICATION_TIMEOUT = 5000;

// Función para verificar una única URL
async function verifyUrl(url) {
    try {
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
        } catch (headError) {
            // Si HEAD falla, intentar con GET
            try {
                const response = await axios.get(url, {
                    timeout: VERIFICATION_TIMEOUT,
                    maxRedirects: 5,
                    validateStatus: () => true
                });

                if (response.status < 400) {
                    return 'valida';
                }
            } catch (getError) {
                return 'invalida';
            }
        }

        // Si ambos fallan o el código es 4xx/5xx
        return 'invalida';
    } catch (error) {
        console.error(`Error verificando URL ${url}:`, error.message);
        return 'invalida';
    }
}

// Función para verificar todos los marcadores en la base de datos
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
                
                // Log cada 10 marcadores
                if (contador % 10 === 0) {
                    console.log(`Verificados ${contador} de ${bookmarks.length} marcadores...`);
                }
            } catch (error) {
                console.error(`Error verificando marcador ${bookmark.id}:`, error.message);
            }
        }

        console.log(`Verificación completada. ${contador} marcadores procesados.`);
        return { verificados: contador, total: bookmarks.length };
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

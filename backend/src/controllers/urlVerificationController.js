// Controlador para gestionar la verificación de URLs

const { verifyAllBookmarks, getBookmarkUrlStatus } = require('../services/urlVerificationService');

// Endpoint para iniciar verificación manual
async function startManualVerification(db) {
    try {
        const resultado = await verifyAllBookmarks(db);
        return {
            success: true,
            mensaje: 'Verificación completada',
            datos: resultado
        };
    } catch (error) {
        throw new Error(`Error en verificación manual: ${error.message}`);
    }
}

// Endpoint para obtener el estado de un marcador específico
async function getBookmarkStatus(db, bookmarkId) {
    try {
        const status = await getBookmarkUrlStatus(db, bookmarkId);
        if (!status) {
            throw new Error('Marcador no encontrado');
        }
        return status;
    } catch (error) {
        throw new Error(`Error obteniendo estado: ${error.message}`);
    }
}

module.exports = {
    startManualVerification,
    getBookmarkStatus
};

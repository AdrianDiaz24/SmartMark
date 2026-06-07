/**
 * @fileoverview Rutas para verificación de URLs
 * @module routes/urlVerification
 */

const express = require('express');
const router = express.Router();
const { startManualVerification, getBookmarkStatus } = require('../controllers/urlVerificationController');

// Iniciar verificación manual
/**
 * POST /api/url-verification/verify
 * @summary Inicia verificación manual de TODAS las URLs de marcadores
 * @tags URL Verification
 * @security Bearer
 * @description Verifica el estado de todas las URLs guardadas. Útil para recarga completa de estadísticas.
 * @returns {object} 200
 * @returns.success {boolean} - true
 * @returns.total {number} - Total de marcadores verificados
 * @returns.validos {number} - URLs que respondieron correctamente (2XX)
 * @returns.invalidos {number} - URLs que no respondieron o dieron error
 * @returns.detalles {string} - Detalles por marcador (ver ejemplo)
 * @returns {object} 401 - No autenticado
 * @returns {object} 500 - Error en verificación
 */
router.post('/verify', async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const resultado = await startManualVerification(db);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
});

// Obtener estado de un marcador específico
/**
 * GET /api/url-verification/status/{bookmarkId}
 * @summary Obtiene el estado actual de una URL específica
 * @tags URL Verification
 * @security Bearer
 * @param {number} bookmarkId.path - ID del marcador (requerido)
 * @returns {object} 200
 * @returns.id {number} - ID del marcador
 * @returns.titulo {string} - Título del marcador
 * @returns.url {string} - URL verificada
 * @returns.estado_url {string} - Estado: 'valida', 'invalida', 'no_verificada'
 * @returns.estado_http {number} - Código HTTP de la última verificación (ej: 200, 404, 500)
 * @returns.fecha_verificacion {string} - Última verificación (ISO date)
 * @returns {object} 401 - No autenticado
 * @returns {object} 404 - Marcador no encontrado
 * @returns {object} 500 - Error interno
 */
router.get('/status/:bookmarkId', async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { bookmarkId } = req.params;
        const status = await getBookmarkStatus(db, bookmarkId);
        res.json(status);
    } catch (error) {
        next(error);
    }
});

module.exports = router;

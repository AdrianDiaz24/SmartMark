/**
 * @fileoverview Middleware de autenticación - Protege rutas requiriendo JWT válido
 * @module middleware/authMiddleware
 */

const { verifyToken } = require('../controllers/authController');

/**
 * Middleware que verifica que el usuario tenga un JWT válido
 * Si es válido, adjunta los datos del usuario a req.usuario
 * Si no es válido o no existe, retorna error 401
 * @function authenticateToken
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
function authenticateToken(req, res, next) {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Espera "Bearer TOKEN"

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado. Acceso denegado.'
            });
        }

        // Verificar que el token sea válido
        const decoded = verifyToken(token);
        
        // Adjuntar datos del usuario al request
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Token inválido o expirado. Acceso denegado.',
            error: error.message
        });
    }
}

module.exports = { authenticateToken };


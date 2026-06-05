/**
 * @fileoverview Rutas de autenticación - Endpoints de registro y login
 * @module routes/auth
 */

const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

/**
 * POST /api/auth/register
 * @summary Registra un nuevo usuario en el sistema
 * @tags Authentication
 * @requestBody {object} required
 * @requestBody.email {string} required - Email del usuario
 * @requestBody.username {string} required - Nombre de usuario
 * @requestBody.password {string} required - Contraseña
 * @returns {object} 201 - Usuario registrado
 * @returns.usuario_id {number} ID del nuevo usuario
 * @returns.email {string} Email confirmado
 * @returns.username {string} Nombre de usuario
 * @returns.token {string} JWT token
 * @returns {object} 400 - Datos inválidos
 * @returns {object} 500 - Error en servidor
 */
router.post('/register', async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const result = await register(req.db, email, username, password);
        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/auth/login
 * @summary Obtiene token JWT con credenciales válidas
 * @tags Authentication
 * @requestBody {object} required
 * @requestBody.email {string} required - Email registrado del usuario
 * @requestBody.password {string} required - Contraseña del usuario
 * @returns {object} 200 - Login exitoso
 * @returns.usuario_id {number} ID del usuario
 * @returns.email {string} Email del usuario
 * @returns.username {string} Nombre de usuario
 * @returns.token {string} JWT token
 * @returns {object} 401 - Credenciales incorrectas
 * @returns {object} 404 - Usuario no existe
 * @returns {object} 500 - Error en servidor
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await login(req.db, email, password);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
});

module.exports = router;


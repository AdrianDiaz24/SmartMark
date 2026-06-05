/**
 * @fileoverview Rutas de autenticación - Endpoints de registro y login
 * @module routes/auth
 */

const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

/**
 * POST /api/auth/register
 * @summary Registra un nuevo usuario
 * @tags Authentication
 * @requestBody {object} required - Credenciales del usuario nuevo
 * @requestBody.email {string} - Email del usuario (requerido)
 * @requestBody.username {string} - Nombre de usuario (requerido)
 * @requestBody.password {string} - Contraseña (requerido, mín 8 caracteres)
 * @returns {object} 201 - Usuario registrado exitosamente
 * @returns.usuario_id {number} - ID del usuario creado
 * @returns.email {string} - Email del usuario
 * @returns.username {string} - Nombre de usuario
 * @returns.token {string} - JWT token para autenticación
 * @returns {object} 400 - Email ya existe o validación fallida
 * @returns {object} 500 - Error interno del servidor
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
 * @summary Inicia sesión de usuario
 * @tags Authentication
 * @requestBody {object} required - Credenciales de login
 * @requestBody.email {string} - Email del usuario (requerido)
 * @requestBody.password {string} - Contraseña (requerido)
 * @returns {object} 200 - Login exitoso
 * @returns.usuario_id {number} - ID del usuario
 * @returns.email {string} - Email del usuario
 * @returns.username {string} - Nombre de usuario
 * @returns.token {string} - JWT token para autenticación
 * @returns {object} 401 - Email o contraseña incorrectos
 * @returns {object} 404 - Usuario no encontrado
 * @returns {object} 500 - Error interno del servidor
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


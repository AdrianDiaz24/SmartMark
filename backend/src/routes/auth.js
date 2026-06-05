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
 * @requestBody {object} required
 * @requestBody.email {string} - Email del usuario (requerido, válido)
 * @requestBody.username {string} - Nombre de usuario (requerido, mín 3 caracteres)
 * @requestBody.password {string} - Contraseña (requerido, mín 8 caracteres)
 * @example
 * {
 *   "email": "usuario@example.com",
 *   "username": "miusuario",
 *   "password": "password123"
 * }
 * @returns {object} 201
 * @returns.usuario_id {number} - ID del usuario creado
 * @returns.email {string} - Email confirmado
 * @returns.username {string} - Nombre de usuario
 * @returns.token {string} - JWT token para autenticación
 * @returns {object} 400
 * @returns.error {string} - Email ya existe / Validación fallida
 * @returns {object} 500
 * @returns.error {string} - Error interno del servidor
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
 * @requestBody {object} required
 * @requestBody.email {string} - Email del usuario (requerido)
 * @requestBody.password {string} - Contraseña (requerido)
 * @example
 * {
 *   "email": "usuario@example.com",
 *   "password": "password123"
 * }
 * @returns {object} 200
 * @returns.usuario_id {number} - ID del usuario
 * @returns.email {string} - Email del usuario
 * @returns.username {string} - Nombre de usuario
 * @returns.token {string} - JWT token para autenticación
 * @returns {object} 401
 * @returns.error {string} - Email o contraseña incorrectos
 * @returns {object} 404
 * @returns.error {string} - Usuario no encontrado
 * @returns {object} 500
 * @returns.error {string} - Error interno del servidor
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


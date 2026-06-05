/**
 * @fileoverview Rutas de autenticación - Endpoints de registro y login
 * @module routes/auth
 */

const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

/**
 * POST /api/auth/register
 * Registra un nuevo usuario
 * @body {string} email - Email del usuario
 * @body {string} username - Nombre de usuario
 * @body {string} password - Contraseña
 * @returns {Object} Usuario y token JWT
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
 * Inicia sesión de usuario
 * @body {string} email - Email del usuario
 * @body {string} password - Contraseña
 * @returns {Object} Usuario y token JWT
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


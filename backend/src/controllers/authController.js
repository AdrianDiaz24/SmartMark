/**
 * @fileoverview Controlador de autenticación - Maneja registro, login y gestión de JWT
 * @module controllers/authController
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { createDefaultTagsForUser } = require('../database/db');

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_aqui_2024';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Registra un nuevo usuario
 * @async
 * @function register
 * @param {Object} db - Instancia de la base de datos
 * @param {string} email - Email del usuario
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña sin encriptar
 * @returns {Promise<Object>} Objeto con usuario y token JWT
 * @throws {Error} Si el email o username ya existen o hay error en BD
 */
async function register(db, email, username, password) {
    try {
        // Validar que el email sea válido
        if (!email || !email.includes('@')) {
            throw new Error('El email debe ser válido');
        }

        // Validar que username tenga al menos 3 caracteres
        if (!username || username.length < 3) {
            throw new Error('El username debe tener al menos 3 caracteres');
        }

        // Validar que la contraseña tenga al menos 6 caracteres
        if (!password || password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }

        // Verificar si el email ya existe
        const emailExists = await db.get('SELECT id FROM Usuarios WHERE email = ?', [email]);
        if (emailExists) {
            throw new Error('El email ya está registrado');
        }

        // Verificar si el username ya existe
        const usernameExists = await db.get('SELECT id FROM Usuarios WHERE username = ?', [username]);
        if (usernameExists) {
            throw new Error('El username ya está en uso');
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insertar usuario en BD
        const result = await db.run(
            'INSERT INTO Usuarios (email, username, password_hash) VALUES (?, ?, ?)',
            [email, username, passwordHash]
        );

        const usuarioId = result.lastID;

        // Crear tags por defecto para el usuario
        await createDefaultTagsForUser(db, usuarioId);

        // Crear token JWT
        const token = jwt.sign(
            { id: usuarioId, email, username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRE }
        );

        return {
            success: true,
            usuario: {
                id: usuarioId,
                email,
                username,
                fecha_creacion: new Date().toISOString()
            },
            token
        };
    } catch (error) {
        throw error;
    }
}

/**
 * Inicia sesión de usuario
 * @async
 * @function login
 * @param {Object} db - Instancia de la base de datos
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña sin encriptar
 * @returns {Promise<Object>} Objeto con usuario y token JWT
 * @throws {Error} Si las credenciales son incorrectas
 */
async function login(db, email, password) {
    try {
        // Validar que se proporcionaron ambos campos
        if (!email || !password) {
            throw new Error('Email y contraseña son requeridos');
        }

        // Buscar usuario por email
        const usuario = await db.get('SELECT * FROM Usuarios WHERE email = ?', [email]);
        if (!usuario) {
            throw new Error('Email o contraseña incorrectos');
        }

        // Verificar contraseña
        const passwordMatch = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordMatch) {
            throw new Error('Email o contraseña incorrectos');
        }

        // Crear token JWT
        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, username: usuario.username },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRE }
        );

        return {
            success: true,
            usuario: {
                id: usuario.id,
                email: usuario.email,
                username: usuario.username,
                fecha_creacion: usuario.fecha_creacion
            },
            token
        };
    } catch (error) {
        throw error;
    }
}

/**
 * Verifica y decodifica un token JWT
 * @function verifyToken
 * @param {string} token - Token JWT
 * @returns {Object} Payload decodificado del token
 * @throws {Error} Si el token es inválido o ha expirado
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        throw new Error('Token inválido o expirado');
    }
}

module.exports = {
    register,
    login,
    verifyToken,
    JWT_SECRET,
    JWT_EXPIRE
};


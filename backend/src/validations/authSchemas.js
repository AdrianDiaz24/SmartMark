/**
 * @fileoverview Esquemas de validación para Autenticación usando Joi
 * @module validations/authSchemas
 */

const Joi = require('joi');

/**
 * Esquema para registro de usuario
 * @type {Joi.ObjectSchema}
 */
const registerSchema = Joi.object({
    email: Joi.string()
        .required()
        .email()
        .lowercase()
        .messages({
            'string.base': 'El email debe ser texto',
            'string.empty': 'El email no puede estar vacío',
            'string.email': 'El email debe ser válido',
            'any.required': 'El email es requerido'
        }),
    
    username: Joi.string()
        .required()
        .min(3)
        .max(30)
        .alphanum()
        .messages({
            'string.base': 'El nombre de usuario debe ser texto',
            'string.empty': 'El nombre de usuario no puede estar vacío',
            'string.min': 'El nombre de usuario debe tener al menos 3 caracteres',
            'string.max': 'El nombre de usuario no puede exceder 30 caracteres',
            'string.alphanum': 'El nombre de usuario solo puede contener letras y números',
            'any.required': 'El nombre de usuario es requerido'
        }),
    
    password: Joi.string()
        .required()
        .min(8)
        .max(100)
        .messages({
            'string.base': 'La contraseña debe ser texto',
            'string.empty': 'La contraseña no puede estar vacía',
            'string.min': 'La contraseña debe tener al menos 8 caracteres',
            'string.max': 'La contraseña no puede exceder 100 caracteres',
            'any.required': 'La contraseña es requerida'
        })
});

/**
 * Esquema para login de usuario
 * @type {Joi.ObjectSchema}
 */
const loginSchema = Joi.object({
    email: Joi.string()
        .required()
        .email()
        .messages({
            'string.base': 'El email debe ser texto',
            'string.empty': 'El email no puede estar vacío',
            'string.email': 'El email debe ser válido',
            'any.required': 'El email es requerido'
        }),
    
    password: Joi.string()
        .required()
        .messages({
            'string.base': 'La contraseña debe ser texto',
            'string.empty': 'La contraseña no puede estar vacía',
            'any.required': 'La contraseña es requerida'
        })
});

module.exports = {
    registerSchema,
    loginSchema
};


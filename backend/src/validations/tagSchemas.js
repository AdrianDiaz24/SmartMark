/**
 * @fileoverview Esquemas de validación para Tags usando Joi
 * @module validations/tagSchemas
 */

const Joi = require('joi');

/**
 * Esquema para crear un nuevo tag
 * @type {Joi.ObjectSchema}
 */
const createTagSchema = Joi.object({
    nombre: Joi.string()
        .required()
        .min(2)
        .max(50)
        .messages({
            'string.base': 'El nombre debe ser texto',
            'string.empty': 'El nombre no puede estar vacío',
            'string.min': 'El nombre debe tener al menos 2 caracteres',
            'string.max': 'El nombre no puede exceder 50 caracteres',
            'any.required': 'El nombre es requerido'
        }),
    
    color: Joi.string()
        .required()
        .regex(/^#[0-9A-F]{6}$/i)
        .messages({
            'string.base': 'El color debe ser texto',
            'string.empty': 'El color no puede estar vacío',
            'string.pattern.base': 'El color debe ser en formato hex válido (ej: #FF5733)',
            'any.required': 'El color es requerido'
        })
});

/**
 * Esquema para actualizar un tag
 * @type {Joi.ObjectSchema}
 */
const updateTagSchema = Joi.object({
    nombre: Joi.string()
        .optional()
        .min(2)
        .max(50)
        .messages({
            'string.min': 'El nombre debe tener al menos 2 caracteres',
            'string.max': 'El nombre no puede exceder 50 caracteres'
        }),
    
    color: Joi.string()
        .optional()
        .regex(/^#[0-9A-F]{6}$/i)
        .messages({
            'string.pattern.base': 'El color debe ser en formato hex válido (ej: #FF5733)'
        })
}).min(1).messages({
    'object.min': 'Al menos un campo debe ser proporcionado para actualizar'
});

module.exports = {
    createTagSchema,
    updateTagSchema
};


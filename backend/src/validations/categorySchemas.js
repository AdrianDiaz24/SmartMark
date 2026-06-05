/**
 * @fileoverview Esquemas de validación para Categorías usando Joi
 * @module validations/categorySchemas
 */

const Joi = require('joi');

/**
 * Esquema para crear una nueva categoría
 * @type {Joi.ObjectSchema}
 */
const createCategorySchema = Joi.object({
    nombre: Joi.string()
        .required()
        .min(2)
        .max(100)
        .messages({
            'string.base': 'El nombre debe ser texto',
            'string.empty': 'El nombre no puede estar vacío',
            'string.min': 'El nombre debe tener al menos 2 caracteres',
            'string.max': 'El nombre no puede exceder 100 caracteres',
            'any.required': 'El nombre es requerido'
        }),
    
    descripcion: Joi.string()
        .optional()
        .max(500)
        .messages({
            'string.base': 'La descripción debe ser texto',
            'string.max': 'La descripción no puede exceder 500 caracteres'
        }),
    
    padre_id: Joi.number()
        .optional()
        .integer()
        .positive()
        .messages({
            'number.base': 'El ID del padre debe ser un número',
            'number.integer': 'El ID del padre debe ser un número entero',
            'number.positive': 'El ID del padre debe ser positivo'
        })
});

/**
 * Esquema para actualizar una categoría
 * @type {Joi.ObjectSchema}
 */
const updateCategorySchema = Joi.object({
    nombre: Joi.string()
        .optional()
        .min(2)
        .max(100)
        .messages({
            'string.min': 'El nombre debe tener al menos 2 caracteres',
            'string.max': 'El nombre no puede exceder 100 caracteres'
        }),
    
    descripcion: Joi.string()
        .optional()
        .max(500)
        .messages({
            'string.max': 'La descripción no puede exceder 500 caracteres'
        }),
    
    padre_id: Joi.number()
        .optional()
        .integer()
        .positive()
        .allow(null)
        .messages({
            'number.integer': 'El ID del padre debe ser un número entero',
            'number.positive': 'El ID del padre debe ser positivo'
        })
}).min(1).messages({
    'object.min': 'Al menos un campo debe ser proporcionado para actualizar'
});

module.exports = {
    createCategorySchema,
    updateCategorySchema
};


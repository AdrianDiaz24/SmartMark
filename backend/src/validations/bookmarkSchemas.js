/**
 * @fileoverview Esquemas de validación para Bookmarks usando Joi
 * @module validations/bookmarkSchemas
 */

const Joi = require('joi');

/**
 * Esquema para crear un nuevo bookmark
 * @type {Joi.ObjectSchema}
 */
const createBookmarkSchema = Joi.object({
    titulo: Joi.string()
        .required()
        .min(3)
        .max(200)
        .messages({
            'string.base': 'El título debe ser texto',
            'string.empty': 'El título no puede estar vacío',
            'string.min': 'El título debe tener al menos 3 caracteres',
            'string.max': 'El título no puede exceder 200 caracteres',
            'any.required': 'El título es requerido'
        }),
    
    url: Joi.string()
        .required()
        .uri()
        .messages({
            'string.base': 'La URL debe ser texto',
            'string.empty': 'La URL no puede estar vacía',
            'string.uri': 'La URL debe ser válida',
            'any.required': 'La URL es requerida'
        }),
    
    descripcion: Joi.string()
        .optional()
        .max(500)
        .messages({
            'string.base': 'La descripción debe ser texto',
            'string.max': 'La descripción no puede exceder 500 caracteres'
        }),
    
    categoria_id: Joi.number()
        .optional()
        .integer()
        .positive()
        .messages({
            'number.base': 'El ID de categoría debe ser un número',
            'number.integer': 'El ID de categoría debe ser un número entero',
            'number.positive': 'El ID de categoría debe ser positivo'
        }),
    
    tag_ids: Joi.array()
        .optional()
        .items(Joi.number().integer().positive())
        .messages({
            'array.base': 'Los tag_ids deben ser un array',
            'array.includes': 'Cada tag_id debe ser un número entero positivo'
        })
});

/**
 * Esquema para actualizar un bookmark
 * @type {Joi.ObjectSchema}
 */
const updateBookmarkSchema = Joi.object({
    titulo: Joi.string()
        .optional()
        .min(3)
        .max(200)
        .messages({
            'string.min': 'El título debe tener al menos 3 caracteres',
            'string.max': 'El título no puede exceder 200 caracteres'
        }),
    
    url: Joi.string()
        .optional()
        .uri()
        .messages({
            'string.uri': 'La URL debe ser válida'
        }),
    
    descripcion: Joi.string()
        .optional()
        .max(500)
        .messages({
            'string.max': 'La descripción no puede exceder 500 caracteres'
        }),
    
    categoria_id: Joi.number()
        .optional()
        .integer()
        .positive()
        .allow(null)
        .messages({
            'number.integer': 'El ID de categoría debe ser un número entero',
            'number.positive': 'El ID de categoría debe ser positivo'
        }),
    
    tag_ids: Joi.array()
        .optional()
        .items(Joi.number().integer().positive())
        .messages({
            'array.includes': 'Cada tag_id debe ser un número entero positivo'
        })
});

/**
 * Esquema para scraping de URL
 * @type {Joi.ObjectSchema}
 */
const scrapeUrlSchema = Joi.object({
    url: Joi.string()
        .required()
        .uri()
        .messages({
            'string.uri': 'La URL debe ser válida',
            'any.required': 'La URL es requerida'
        })
});

module.exports = {
    createBookmarkSchema,
    updateBookmarkSchema,
    scrapeUrlSchema
};


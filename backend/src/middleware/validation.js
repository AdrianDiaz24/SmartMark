/**
 * @fileoverview Middleware de validación usando Joi
 * @module middleware/validation
 */

/**
 * Crea un middleware de validación para un esquema Joi
 * @param {Joi.ObjectSchema} schema - Esquema Joi a validar
 * @returns {Function} Middleware Express
 */
function validate(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const messages = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(400).json({
                error: 'Validación fallida',
                details: messages
            });
        }

        // Reemplazar req.body con los datos validados y limpios
        req.body = value;
        next();
    };
}

module.exports = validate;


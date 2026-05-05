// Middleware para manejo centralizado de errores

function errorHandler(err, req, res, next) {
    console.error('Error:', err.message);

    // Errores de validación
    if (err.message.includes('requerido') || err.message.includes('no es válida')) {
        return res.status(400).json({ error: err.message });
    }

    // Errores de no encontrado
    if (err.message.includes('no encontrado')) {
        return res.status(404).json({ error: err.message });
    }

    // Errores de conflicto (duplicados, etc)
    if (err.message.includes('Ya existe')) {
        return res.status(409).json({ error: err.message });
    }

    // Error genérico de servidor
    res.status(500).json({ error: 'Error interno del servidor' });
}

module.exports = errorHandler;


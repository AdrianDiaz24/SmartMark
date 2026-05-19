const express = require('express');
const router = express.Router();
const { startManualVerification, getBookmarkStatus } = require('../controllers/urlVerificationController');

// Iniciar verificación manual
router.post('/verify', async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const resultado = await startManualVerification(db);
        res.json(resultado);
    } catch (error) {
        next(error);
    }
});

// Obtener estado de un marcador específico
router.get('/status/:bookmarkId', async (req, res, next) => {
    try {
        const db = req.app.locals.db;
        const { bookmarkId } = req.params;
        const status = await getBookmarkStatus(db, bookmarkId);
        res.json(status);
    } catch (error) {
        next(error);
    }
});

module.exports = router;

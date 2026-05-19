const { verifyAllBookmarks } = require('../services/urlVerificationService');

/**
 * @fileoverview Sistema adaptativo de verificación de URLs para SmartMark
 * Diseñado para funciones en servidores autohosteados que no están siempre encendidos
 * @module config/cronJobConfig
 */

/** @constant {number} VERIFICATION_INTERVAL - Intervalo de verificación en milisegundos (7 días) */
const VERIFICATION_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

/**
 * Verifica si es necesario ejecutar la verificación de URLs
 *
 * Sistema adaptativo que:
 * - No depende de horarios fijos (como cron tradicional)
 * - Funciona en servidores que se reinician ocasionalmente
 * - Ejecuta verificación si han pasado 7 días desde la última
 * - Guarda un log de cada verificación en la tabla verification_log
 *
 * @async
 * @function checkAndVerifyIfNeeded
 * @param {Object} db - Instancia de la base de datos SQLite
 * @returns {Promise<void>}
 * @throws {Error} Error se captura y guarda en verification_log
 *
 * @example
 * // Se ejecuta al iniciar el servidor
 * const db = await initDB();
 * await checkAndVerifyIfNeeded(db);
 * // Si han pasado 7 días, verifica todas las URLs
 * // Si no, solo muestra el estado
 */
async function checkAndVerifyIfNeeded(db) {
    try {
        console.log('\n========== VERIFICADOR DE URLs ==========');
        console.log(`Verificación iniciada: ${new Date().toLocaleString()}`);

        // 1. Obtener el último registro de verificación
        const lastLog = await db.get(`
            SELECT last_verification, status FROM verification_log 
            ORDER BY id DESC 
            LIMIT 1
        `);

        // 2. Calcular tiempo desde última verificación
        let shouldVerify = true;
        
        if (lastLog) {
            const lastVerificationTime = new Date(lastLog.last_verification).getTime();
            const currentTime = new Date().getTime();
            const timeSinceLastVerification = currentTime - lastVerificationTime;

            // Formatear fecha a DD-MM-YYYY
            const [year, month, day] = lastLog.last_verification.split('-');
            const fechaFormateada = `${day}-${month}-${year}`;

            console.log(`Última verificación: ${fechaFormateada}`);
            console.log(`Tiempo transcurrido: ${Math.floor(timeSinceLastVerification / (1000 * 60 * 60 * 24))} días`);

            if (timeSinceLastVerification < VERIFICATION_INTERVAL) {
                shouldVerify = false;
                console.log(`No es necesario verificar aún (faltan ${Math.floor((VERIFICATION_INTERVAL - timeSinceLastVerification) / (1000 * 60 * 60 * 24))} días)`);
            }
        } else {
            console.log(`Primera verificación del sistema`);
        }

        // 3. Si pasó 1 semana, ejecutar verificación
        if (shouldVerify) {
            console.log(`Ejecutando verificación de URLs...`);
            
            const resultado = await verifyAllBookmarks(db);
            
            // 4. Guardar log de la verificación
            await db.run(`
                INSERT INTO verification_log (last_verification, status, marcadores_verificados, marcadores_invalidos)
                VALUES (CURRENT_TIMESTAMP, 'completed', ?, ?)
            `, [resultado.total, resultado.invalidos]);

            console.log(`Verificación completada exitosamente`);
            console.log(`Estadísticas:`, resultado);
        }

        console.log('======================================================\n');
        
    } catch (error) {
        console.error('Error en verificador de URLs:', error.message);
        
        // Guardar error en log
        try {
            await db.run(`
                INSERT INTO verification_log (status, errores)
                VALUES ('failed', ?)
            `, [error.message]);
        } catch (logError) {
            console.error('Error guardando log de error:', logError.message);
        }
    }
}

module.exports = {
    checkAndVerifyIfNeeded
};



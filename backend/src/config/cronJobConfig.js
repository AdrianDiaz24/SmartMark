const { verifyAllBookmarks } = require('../services/urlVerificationService');

const VERIFICATION_INTERVAL = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

/**
 * Chequea si pasó 1 semana desde la última verificación
 * Si pasó, ejecuta la verificación de URLs
 * Esto permite que funcione en servidores autohosteados que no están siempre encendidos
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

            console.log(`Última verificación: ${lastLog.last_verification}`);
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



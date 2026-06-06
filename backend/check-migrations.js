#!/usr/bin/env node

/**
 * Script para ver el estado de las migraciones
 * Uso: npm run check-migrations
 */

const { open } = require('sqlite');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const { getMigrationsInfo, readMigrationFiles } = require('./src/database/migrationRunner');

async function checkMigrations() {
    const databasePath = process.env.DATABASE_PATH || './src/database/smartmark.db';
    
    try {
        console.log('SmartMark - Estado de Migraciones');

        // Leer migraciones disponibles
        const todasLasMigraciones = readMigrationFiles();
        console.log(`Migraciones disponibles en carpeta: ${todasLasMigraciones.length}`);
        todasLasMigraciones.forEach(m => {
            console.log(`   → ${m.nombre}`);
        });

        // Conectar a BD (si existe)
        if (!fs.existsSync(databasePath)) {
            console.log(`\n⚠La base de datos aún no existe: ${databasePath}`);
            console.log('Se creará la próxima vez que inicie el servidor.\n');
            return;
        }

        console.log(`\n🗄️  Conectando a base de datos: ${databasePath}\n`);
        
        const db = await open({
            filename: databasePath,
            driver: sqlite3.Database
        });

        // Obtener migraciones aplicadas
        const aplicadas = await getMigrationsInfo(db);
        
        console.log(`Migraciones aplicadas: ${aplicadas.length}\n`);
        
        if (aplicadas.length === 0) {
            console.log('   (Ninguna migración aplicada aún)');
        } else {
            console.log('   Migración                 Fecha                  Duración ');
            aplicadas.forEach(m => {
                const fecha = new Date(m.fecha_aplicacion).toLocaleString('es-ES');
                const duracion = m.duracion_ms ? `${m.duracion_ms}ms` : '-';
                console.log(`│ ${m.nombre.padEnd(28)} │ ${fecha.padEnd(25)} │ ${duracion.padEnd(10)} │`);
            });

        }

        // Ver si hay migraciones pendientes
        const aplicadasSet = new Set(aplicadas.map(m => {
            const match = m.nombre.match(/^V(\d{3})/);
            return match ? `V${match[1]}` : null;
        }));

        const pendientes = todasLasMigraciones.filter(m => !aplicadasSet.has(m.version));
        
        if (pendientes.length > 0) {
            console.log(`\n⏱ Migraciones pendientes: ${pendientes.length}\n`);
            pendientes.forEach(m => {
                console.log(`   → ${m.nombre}`);
            });
            console.log('\nℹSe aplicarán automáticamente cuando inicie el servidor.\n');
        } else {
            console.log('\nTodas las migraciones están aplicadas\n');
        }

        await db.close();
    } catch (error) {
        console.error('\n✗ Error:', error.message);
        process.exit(1);
    }
}

checkMigrations();


/**
 * @fileoverview Sistema de migraciones versionadas para SmartMark
 * Ejecuta migraciones SQL en orden y registra su aplicación
 * @module database/migrationRunner
 */

const fs = require('fs');
const path = require('path');

/**
 * Inicializa la tabla de migraciones (si no existe)
 * @async
 * @param {Object} db - Instancia de la base de datos
 * @returns {Promise<void>}
 */
async function initMigrationsTable(db) {
    try {
        await db.exec(`
            CREATE TABLE IF NOT EXISTS migrations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL UNIQUE,
                fecha_aplicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
                duracion_ms INTEGER
            );
        `);
        console.log('Tabla de migraciones inicializada');
    } catch (error) {
        console.error('Error inicializando tabla de migraciones:', error);
        throw error;
    }
}

/**
 * Obtiene el nombre del archivo de migración basado en su versión
 * Se espera formato: V001__Description.sql, V002__Description.sql, etc.
 * @param {string} filename - Nombre del archivo
 * @returns {string|null} Versión normalizada (ej: V001) o null si no coincide
 */
function parseMigrationVersion(filename) {
    const match = filename.match(/^V(\d{3})__/);
    return match ? `V${match[1]}` : null;
}

/**
 * Lee y parsea todos los archivos de migración de la carpeta
 * Solo lee archivos .sql con formato V00X__Description.sql
 * @returns {Array<Object>} Array de migraciones con propiedades: version, nombre, contenido, rutaArchivo
 */
function readMigrationFiles() {
    const migrationsDir = path.join(__dirname, 'migrations');
    
    // Crear directorio si no existe
    if (!fs.existsSync(migrationsDir)) {
        fs.mkdirSync(migrationsDir, { recursive: true });
        console.log(`Carpeta de migraciones creada: ${migrationsDir}`);
    }

    let files = [];
    try {
        files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Ordenar alfabéticamente para garantizar orden de ejecución
    } catch (error) {
        console.error('Error leyendo carpeta de migraciones:', error);
        return [];
    }

    const migrations = [];
    for (const file of files) {
        const version = parseMigrationVersion(file);
        if (!version) {
            console.warn(`Archivo de migración ignorado (formato inválido): ${file}`);
            continue;
        }

        const rutaArchivo = path.join(migrationsDir, file);
        const contenido = fs.readFileSync(rutaArchivo, 'utf8');

        migrations.push({
            version,
            nombre: file,
            contenido,
            rutaArchivo
        });
    }

    return migrations;
}

/**
 * Obtiene qué migraciones ya han sido aplicadas
 * @async
 * @param {Object} db - Instancia de la base de datos
 * @returns {Promise<Set<string>>} Set de versiones aplicadas (ej: {V001, V002})
 */
async function getAppliedMigrations(db) {
    try {
        const applied = await db.all(
            'SELECT nombre FROM migrations ORDER BY nombre'
        );
        return new Set(applied.map(m => parseMigrationVersion(m.nombre)));
    } catch (error) {
        console.error('Error obteniendo migraciones aplicadas:', error);
        return new Set();
    }
}

/**
 * Registra una migración como aplicada en la tabla de migraciones
 * @async
 * @param {Object} db - Instancia de la base de datos
 * @param {string} nombre - Nombre completo del archivo (ej: V001__Initial_Schema.sql)
 * @param {number} duracionMs - Tiempo que tardó en ejecutarse (en ms)
 * @returns {Promise<void>}
 */
async function recordMigration(db, nombre, duracionMs) {
    try {
        await db.run(
            'INSERT INTO migrations (nombre, duracion_ms) VALUES (?, ?)',
            [nombre, duracionMs]
        );
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            // La migración ya existe, ignorar
            return;
        }
        throw error;
    }
}

/**
 * Ejecuta una migración SQL
 * Divide el contenido por ; para ejecutar múltiples sentencias
 * @async
 * @param {Object} db - Instancia de la base de datos
 * @param {string} sql - Contenido SQL a ejecutar
 * @returns {Promise<void>}
 */
async function executeMigrationSql(db, sql) {
    try {
        // Ejecutar todo el SQL de una sola vez
        // SQLite puede manejar múltiples statements separados por ;
        await db.exec(sql);
    } catch (error) {
        // Ignorar errores de "tabla ya existe" (CREATE TABLE IF NOT EXISTS)
        if (!error.message.includes('already exists') && !error.message.includes('UNIQUE constraint failed')) {
            throw error;
        }
    }
}

/**
 * Ejecuta todas las migraciones pendientes
 * @async
 * @param {Object} db - Instancia de la base de datos
 * @returns {Promise<Object>} Resumen de migraciones: {aplicadas: number, saltadas: number}
 */
async function runMigrations(db) {
    try {
        // 1. Inicializar tabla de migraciones
        await initMigrationsTable(db);

        // 2. Leer archivos de migraciones
        const migrations = readMigrationFiles();
        if (migrations.length === 0) {
            console.log('⚠ No se encontraron migraciones\n');
            return { aplicadas: 0, saltadas: 0 };
        }

        // 3. Obtener migraciones ya aplicadas
        const appliedSet = await getAppliedMigrations(db);

        // 4. Ejecutar migraciones pendientes
        let aplicadas = 0;
        let saltadas = 0;

        for (const migration of migrations) {
            const version = migration.version;

            if (appliedSet.has(version)) {
                console.log(`⊘ ${migration.nombre} (ya aplicada)`);
                saltadas++;
            } else {
                console.log(`→ Ejecutando ${migration.nombre}...`);
                const inicio = Date.now();

                try {
                    await executeMigrationSql(db, migration.contenido);
                    const duracion = Date.now() - inicio;
                    await recordMigration(db, migration.nombre, duracion);

                    console.log(`✓ ${migration.nombre} (${duracion}ms)\n`);
                    aplicadas++;
                } catch (error) {
                    console.error(`✗ Error en ${migration.nombre}:`, error.message);
                    throw error;
                }
            }
        }

        console.log(`Resumen: ${aplicadas} nuevas aplicadas, ${saltadas} saltadas`);

        return { aplicadas, saltadas };
    } catch (error) {
        console.error('Error fatal en el sistema de migraciones:', error);
        throw error;
    }
}

/**
 * Obtiene información de migraciones aplicadas (para debugging)
 * @async
 * @param {Object} db - Instancia de la base de datos
 * @returns {Promise<Array>} Array de migraciones con sus detalles
 */
async function getMigrationsInfo(db) {
    try {
        return await db.all(
            `SELECT nombre, fecha_aplicacion, duracion_ms 
             FROM migrations 
             ORDER BY nombre`
        );
    } catch (error) {
        console.error('Error obteniendo información de migraciones:', error);
        return [];
    }
}

module.exports = {
    runMigrations,
    getMigrationsInfo,
    initMigrationsTable,
    readMigrationFiles,
    getAppliedMigrations
};


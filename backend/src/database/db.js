const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const { runMigrations } = require('./migrationRunner');

/**
 * @fileoverview Inicialización y configuración de la base de datos SQLite para SmartMark
 * @module database/db
 * 
 * Ahora utiliza un sistema de migraciones versionadas ubicado en ./migrations/
 * Las migraciones se ejecutan automáticamente al inicializar la BD
 */

/**
 * Inicializa la conexión a la base de datos SQLite y ejecuta migraciones
 * @async
 * @function initDB
 * @returns {Promise<Object>} Instancia de la conexión a la base de datos
 * @throws {Error} Si hay error al conectarse a la BD o ejecutar migraciones
 *
 * @description
 * Proceso de inicialización:
 * 1. Abre la conexión a SQLite
 * 2. Ejecuta el sistema de migraciones versionadas
 * 3. Crea tags por defecto para nuevos usuarios
 * 
 * Las tablas se crean mediante migraciones SQL ubicadas en ./migrations/
 * Esto permite evolucionar el esquema de forma controlada entre versiones
 *
 * @example
 * const db = await initDB();
 * const allBookmarks = await db.all('SELECT * FROM Marcadores');
 */
async function initDB() {

    // Abre la conexión
    const databasePath = process.env.DATABASE_PATH || './src/database/smartmark.db';
    const db = await open({
        filename: databasePath,
        driver: sqlite3.Database
    });

    console.log('Conexión a la base de datos SQLite establecida correctamente.');

    // ACTIVA EXPLÍCITAMENTE LAS CLAVES FORÁNEAS (PRAGMA foreign_keys = ON)
    try {
        await db.exec('PRAGMA foreign_keys = ON');
        console.log('✓ PRAGMA foreign_keys = ON activado');
    } catch (error) {
        console.error('⚠ Error activando PRAGMA foreign_keys:', error.message);
    }

    // Ejecuta migraciones versionadas
    try {
        await runMigrations(db);
    } catch (error) {
        console.error('Error fatal ejecutando migraciones:', error);
        throw error;
    }

    // Insertar tags por defecto (solo si no existen)
    await insertDefaultTags(db);

    return db;
}

async function insertDefaultTags(db) {
    // Estos tags globales se mantienen solo como referencia
    // Los tags específicos del usuario se crean en el controlador auth
    const defaultTags = [
        // Lenguajes de Programación
        { nombre: 'JavaScript', color: 'FFE943' },    // Amarillo (característico de JS)
        { nombre: 'TypeScript', color: '33A4DC' },    // Azul claro
        { nombre: 'Python', color: '33A4DC' },        // Azul claro
        { nombre: 'Java', color: '33A4DC' },          // Azul claro
        { nombre: 'C#', color: '51986C' },            // Verde
        { nombre: 'Go', color: '33A4DC' },            // Azul claro
        { nombre: 'Rust', color: 'FF4343' },          // Rojo
        { nombre: 'PHP', color: '593DF9' },           // Púrpura
        { nombre: 'Kotlin', color: '593DF9' },        // Púrpura (característico de Kotlin)
        { nombre: 'C++', color: '616060' },           // Gris
        { nombre: 'Ruby', color: 'FF4343' },          // Rojo
        { nombre: 'SQL', color: '33A4DC' },           // Azul claro
        { nombre: 'CSS', color: '33A4DC' },           // Azul claro (característico de CSS)
        { nombre: 'HTML', color: 'FF4343' },          // Rojo (característico de HTML)

        // Frameworks y Librerías
        { nombre: 'React', color: '33DCCB' },         // Turquesa (característico de React)
        { nombre: 'Vue', color: '51986C' },           // Verde
        { nombre: 'Angular', color: 'FF4343' },       // Rojo (característico de Angular)
        { nombre: 'Node.js', color: '51986C' },       // Verde (característico de Node)
        { nombre: 'Django', color: '51986C' },        // Verde
        { nombre: 'FastAPI', color: '51986C' },       // Verde
        { nombre: 'Spring', color: '51986C' },        // Verde

        // Herramientas y Plataformas
        { nombre: 'Docker', color: '33A4DC' },        // Azul (característico de Docker)
        { nombre: 'GitHub', color: '616060' },        // Gris
        { nombre: 'GitLab', color: 'FFE943' },        // Amarillo
        { nombre: 'AWS', color: 'FFE943' },           // Amarillo
        { nombre: 'Firebase', color: 'FFE943' },      // Amarillo
        { nombre: 'Kubernetes', color: '33A4DC' },    // Azul claro
        { nombre: 'Git', color: 'FF4343' },           // Rojo
        { nombre: 'npm', color: 'FF4343' },           // Rojo (característico de npm)
        { nombre: 'Docker Compose', color: '33A4DC' }  // Azul claro
    ];

    // Esta tabla solo se usa como referencia para no duplicar los tags globales
    // Los tags reales de cada usuario se almacenan en la tabla Tags con usuario_id
    console.log('Tags predefinidos de programación listados como referencia');
}

/**
 * Crea los tags por defecto para un usuario nuevo
 * @param {Object} db - Instancia de la base de datos
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Array>} Array de tags creados
 */
async function createDefaultTagsForUser(db, usuarioId) {
    const defaultTags = [
        // Lenguajes de Programación
        { nombre: 'JavaScript', color: 'FFE943' },
        { nombre: 'TypeScript', color: '33A4DC' },
        { nombre: 'Python', color: '33A4DC' },
        { nombre: 'Java', color: '33A4DC' },
        { nombre: 'C#', color: '51986C' },
        { nombre: 'Go', color: '33A4DC' },
        { nombre: 'Rust', color: 'FF4343' },
        { nombre: 'PHP', color: '593DF9' },
        { nombre: 'Kotlin', color: '593DF9' },
        { nombre: 'C++', color: '616060' },
        { nombre: 'Ruby', color: 'FF4343' },
        { nombre: 'SQL', color: '33A4DC' },
        { nombre: 'CSS', color: '33A4DC' },
        { nombre: 'HTML', color: 'FF4343' },
        { nombre: 'React', color: '33DCCB' },
        { nombre: 'Vue', color: '51986C' },
        { nombre: 'Angular', color: 'FF4343' },
        { nombre: 'Node.js', color: '51986C' },
        { nombre: 'Django', color: '51986C' },
        { nombre: 'FastAPI', color: '51986C' },
        { nombre: 'Spring', color: '51986C' },
        { nombre: 'Docker', color: '33A4DC' },
        { nombre: 'GitHub', color: '616060' },
        { nombre: 'GitLab', color: 'FFE943' },
        { nombre: 'AWS', color: 'FFE943' },
        { nombre: 'Firebase', color: 'FFE943' },
        { nombre: 'Kubernetes', color: '33A4DC' },
        { nombre: 'Git', color: 'FF4343' },
        { nombre: 'npm', color: 'FF4343' },
        { nombre: 'Docker Compose', color: '33A4DC' }
    ];

    try {
        const tagsDuplicados = [];
        for (let tag of defaultTags) {
            // Verificar si el tag ya existe para este usuario
            const existe = await db.get(
                'SELECT id FROM Tags WHERE nombre = ? AND usuario_id = ?',
                [tag.nombre, usuarioId]
            );
            if (!existe) {
                await db.run(
                    'INSERT INTO Tags (nombre, color, usuario_id, es_default) VALUES (?, ?, ?, 1)',
                    [tag.nombre, tag.color, usuarioId]
                );
            } else {
                tagsDuplicados.push(tag.nombre);
            }
        }
        console.log(`Tags creados para usuario ${usuarioId}. Duplicados: ${tagsDuplicados.length}`);
        return defaultTags;
    } catch (error) {
        console.error('Error creando tags por defecto para usuario:', error.message);
        return [];
    }
}

module.exports = initDB;
module.exports.createDefaultTagsForUser = createDefaultTagsForUser;

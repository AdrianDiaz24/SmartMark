const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

/**
 * @fileoverview Inicialización y configuración de la base de datos SQLite para SmartMark
 * Define el esquema completo de tablas con relaciones jerárquicas
 * @module database/db
 */

/**
 * Inicializa la conexión a la base de datos SQLite y crea todas las tablas
 * @async
 * @function initDB
 * @returns {Promise<Object>} Instancia de la conexión a la base de datos
 * @throws {Error} Si hay error al conectarse a la BD o crear tablas
 *
 * @description
 * Crea las siguientes tablas:
 * - **Categorias**: Carpetas con soporte para jerarquía (padre_id)
 * - **Tags**: Etiquetas coloreadas para clasificar contenido
 * - **Marcadores**: Bookmarks con metadatos GitHub y estado de URL
 * - **Marcadores_Tags**: Relación many-to-many entre marcadores y tags
 * - **Categorias_Tags**: Relación many-to-many entre categorías y tags
 * - **verification_log**: Registro de las verificaciones de URLs del sistema
 *
 * @example
 * const db = await initDB();
 * const allBookmarks = await db.all('SELECT * FROM Marcadores');
 */
async function initDB() {

    // 1. Abrimos la conexión
    const databasePath = process.env.DATABASE_PATH || './src/database/smartmark.db';
    const db = await open({
        filename: databasePath,
        driver: sqlite3.Database
    });

    console.log('Conexión a la base de datos SQLite establecida correctamente.');

    // 2. Ejecutamos código SQL puro para crear todas las tablas
    await db.exec(`
        -- 1. TABLA DE USUARIOS
        CREATE TABLE IF NOT EXISTS Usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            username TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- 2. TABLA DE CATEGORÍAS 
        CREATE TABLE IF NOT EXISTS Categorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            padre_id INTEGER,
            usuario_id INTEGER NOT NULL,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (padre_id) REFERENCES Categorias(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
        );

        -- 3. TABLA DE ETIQUETAS 
        CREATE TABLE IF NOT EXISTS Tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            color TEXT NOT NULL, 
            usuario_id INTEGER NOT NULL,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            es_default BOOLEAN DEFAULT 0,
            FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
            UNIQUE (nombre, usuario_id)
        );

        -- 4. TABLA DE MARCADORES (Tus enlaces guardados)
        CREATE TABLE IF NOT EXISTS Marcadores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            url TEXT NOT NULL,
            descripcion TEXT,
            portada BLOB,
            categoria_id INTEGER,
            usuario_id INTEGER NOT NULL,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            ultima_apertura DATETIME,
            github_stars INTEGER DEFAULT 0,
            github_forks INTEGER DEFAULT 0,
            github_watchers INTEGER DEFAULT 0,
            github_languages TEXT,
            url_estado TEXT DEFAULT 'desconocido',
            ultima_verificacion DATETIME,
            FOREIGN KEY (categoria_id) REFERENCES Categorias(id) ON DELETE CASCADE,
            FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
        );

        -- 5. TABLA INTERMEDIA (Relación Muchos a Muchos)
        -- Empareja un Marcador con un Tag
        CREATE TABLE IF NOT EXISTS Marcadores_Tags (
            marcador_id INTEGER,
            tag_id INTEGER,
            PRIMARY KEY (marcador_id, tag_id),
            FOREIGN KEY (marcador_id) REFERENCES Marcadores(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
        );

        -- 6. TABLA INTERMEDIA (Relación Muchos a Muchos)
        -- Empareja una Categoría con un Tag
        CREATE TABLE IF NOT EXISTS Categorias_Tags (
            categoria_id INTEGER,
            tag_id INTEGER,
            PRIMARY KEY (categoria_id, tag_id),
            FOREIGN KEY (categoria_id) REFERENCES Categorias(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
        );

        -- 7. TABLA DE LOG DE VERIFICACIÓN
        -- Registra la última verificación de URLs
        CREATE TABLE IF NOT EXISTS verification_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            last_verification DATETIME DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'completed',
            marcadores_verificados INTEGER DEFAULT 0,
            marcadores_invalidos INTEGER DEFAULT 0,
            errores TEXT
        );
    `);

    console.log('Tablas creadas correctamente');

    // 3. Insertar tags por defecto (solo si no existen)
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

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

async function initDB() {

    // 1. Abrimos la conexión
    const db = await open({
        filename: './src/database/smartmark.db',
        driver: sqlite3.Database
    });

    console.log('Conexión a la base de datos SQLite establecida correctamente.');

    // 2. Ejecutamos código SQL puro para crear todas las tablas
    await db.exec(`
        -- 1. TABLA DE CATEGORÍAS 
        CREATE TABLE IF NOT EXISTS Categorias (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            padre_id INTEGER, -- Si es NULL, va a la raíz. Si tiene un ID, es una subcarpeta.
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (padre_id) REFERENCES Categorias(id) ON DELETE CASCADE
        );

        -- 2. TABLA DE ETIQUETAS 
        CREATE TABLE IF NOT EXISTS Tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL UNIQUE, 
            color TEXT NOT NULL, 
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            es_default BOOLEAN DEFAULT 0
        );

        -- 3. TABLA DE MARCADORES (Tus enlaces guardados)
        CREATE TABLE IF NOT EXISTS Marcadores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            url TEXT NOT NULL,
            descripcion TEXT,
            portada BLOB, -- Almacena la imagen en formato binario
            categoria_id INTEGER, -- Si es NULL, el enlace se muestra suelto en la raíz.
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            ultima_apertura DATETIME, -- Registra cuándo se abrió el marcador por última vez
            github_stars INTEGER DEFAULT 0, -- Para repositorios de GitHub
            github_forks INTEGER DEFAULT 0,
            github_watchers INTEGER DEFAULT 0,
            github_languages TEXT, -- JSON array: ["JavaScript", "Python", ...]
            FOREIGN KEY (categoria_id) REFERENCES Categorias(id) ON DELETE CASCADE
        );


        -- 4. TABLA INTERMEDIA (Relación Muchos a Muchos)
        -- Empareja un Marcador con un Tag
        CREATE TABLE IF NOT EXISTS Marcadores_Tags (
            marcador_id INTEGER,
            tag_id INTEGER,
            PRIMARY KEY (marcador_id, tag_id), -- Evita que le pongamos la misma etiqueta dos veces al mismo enlace
            FOREIGN KEY (marcador_id) REFERENCES Marcadores(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
        );

        -- 5. TABLA INTERMEDIA (Relación Muchos a Muchos)
        -- Empareja una Categoría con un Tag
        CREATE TABLE IF NOT EXISTS Categorias_Tags (
            categoria_id INTEGER,
            tag_id INTEGER,
            PRIMARY KEY (categoria_id, tag_id),
            FOREIGN KEY (categoria_id) REFERENCES Categorias(id) ON DELETE CASCADE,
            FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
        );
    `);

    console.log('Tablas creadas correctamente');

    // 3. Insertar tags por defecto (solo si no existen)
    await insertDefaultTags(db);

    return db;
}

async function insertDefaultTags(db) {
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

    try {
        for (let tag of defaultTags) {
            // Verificar si el tag ya existe
            const existe = await db.get('SELECT id FROM Tags WHERE nombre = ?', [tag.nombre]);
            if (!existe) {
                await db.run(
                    'INSERT INTO Tags (nombre, color, es_default) VALUES (?, ?, 1)',
                    [tag.nombre, tag.color]
                );
                console.log(`Tag por defecto agregado: ${tag.nombre} (${tag.color})`);
            }
        }
    } catch (error) {
        console.error('Error insertando tags por defecto:', error.message);
    }
}

module.exports = initDB;

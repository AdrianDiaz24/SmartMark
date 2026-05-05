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
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
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
    `);

    console.log('Tablas creadas correctamente');

    return db;
}

module.exports = initDB;

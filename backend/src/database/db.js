
// El '.verbose()' sirve para que, si hay un error en la base de datos,
// la consola nos dé muchísimos detalles para ayudarnos a encontrar el fallo.
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

// Asyncrona para que node espere a que se levante la BD
async function initDB() {

    // Abre la conexión
    const db = await open({
        // Aquí le decimos dónde queremos que cree el archivo físico de la base de datos
        filename: './src/database/smartmark.db',
        // Le indicamos qué motor debe usar para leerlo
        driver: sqlite3.Database
    });

    console.log('Conexión a la base de datos SQLite establecida correctamente.');

    // 4. Devolvemos la conexión lista para ser usada por otros archivos
    return db;
}

// Si no lo exportas, este archivo es invisible para el resto de tu proyecto.
module.exports = initDB;
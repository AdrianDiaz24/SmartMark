// Importamos la librería Express
const express = require('express');

// Exportar la funcion de iniciar la BD, desde el archivo especificado
const initDB = require('./database/db')

// Iniciamos la aplicación
const app = express();

// Definir el puerto donde va a escuchar el servidor
const PORT = 3000;

// Crear la ruta principal (cuando entres a localhost:3000)
app.get('/', (req, res) => {
  res.send('¡Hola Mundo desde el backend de SmartMark!');
});

// Encender el servidor y la BD
app.listen(PORT, async () => {
  console.log(`Servidor de SmartMark corriendo perfectamente en http://localhost:${PORT}`);

  await initDB()
});
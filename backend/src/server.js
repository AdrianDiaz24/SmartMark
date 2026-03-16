// 1. Importamos la librería Express
const express = require('express');

// 2. Iniciamos la aplicación
const app = express();

// 3. Definimos el puerto donde va a escuchar el servidor
const PORT = 3000;

// 4. Creamos la ruta principal (cuando entres a localhost:3000)
app.get('/', (req, res) => {
  res.send('¡Hola Mundo desde el backend de SmartMark!');
});

// 5. Encendemos el servidor
app.listen(PORT, () => {
  console.log(`Servidor de SmartMark corriendo perfectamente en http://localhost:${PORT}`);
});
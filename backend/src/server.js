const express = require('express');
const initDB = require('./database/db');

const app = express();
const PORT = 3000;

// 1º ENDPOINT (GET /api/links)
app.get('/api/links', (req, res) => {
  // Creamos un array con un par de objetos simulando lo que leeremos de SQLite en el futuro
  const datosDePrueba = [
    {
      id: 1,
      titulo: "Documentación de React",
      url: "https://react.dev",
      descripcion: "La web oficial para aprender React",
      imagen: "https://react.dev/favicon.ico",
      categoria_id: null
    },
    {
      id: 2,
      titulo: "MDN Web Docs",
      url: "https://developer.mozilla.org",
      descripcion: "Referencia para HTML, CSS y JS",
      imagen: null,
      categoria_id: null
    }
  ];

  res.json(datosDePrueba);
});

// LA RUTA RAÍZ
app.get('/', (req, res) => {
  res.send('¡Hola Mundo desde el backend de SmartMark!');
});

// ARRANQUE DEL SERVIDOR
app.listen(PORT, async () => {
  console.log(`Servidor de SmartMark corriendo en http://localhost:${PORT}`);
  await initDB();
});
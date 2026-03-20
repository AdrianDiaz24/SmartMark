const express = require('express');
const initDB = require('./database/db');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json())

// variable que guarda la conexion a la BD para llamarla
let db;

app.post('/api/links', async (req, res) => {
  const {url} = req.body;
  if (!url) {
    return res.status(400).json({error: 'La URL es requerida'});
  } else {
    try {
      const resultado = await db.run('INSERT INTO Marcadores (url) VALUES (?)', [url]);
      res.status(201).json({mensaje: 'Marcador creado con exito', id: resultado.lastID, url});
    } catch (error) {
      console.error('Error al insertar el marcador:', error);
      res.status(500).json({error: 'Error al crear el marcador'});
    }
  }
})

app.get('/api/links', async (req, res) => {
  try {
    const marcadores = await db.all('SELECT * FROM Marcadores');
    res.json(marcadores);
  } catch (error) {
    console.error('Error al obtener los marcadores:', error);
    res.status(500).json({error: 'Error al obtener los marcadores'});
  }
});

app.delete('/api/links/:id', async (req, res) => {
  const {id} = req.params;

  try {
    const resultado = await db.run('DELETE FROM Marcadores WHERE id = ?', [id]);
    if (resultado.changes === 0) {
      res.status(404).json({mensaje: 'Marcador no encontrado'});
    } else {
      res.status(200).json({mensaje: 'Marcador eliminado con exito'});
    }
  } catch (error) {
    console.error('Error al eliminar el marcador:', error);
    res.status(500).json({error: 'Error al eliminar el marcador'});
  }
})

// LA RUTA RAÍZ
  app.get('/', (req, res) => {
    res.send('¡Hola Mundo desde el backend de SmartMark!');
  });

// ARRANQUE DEL SERVIDOR
  app.listen(PORT, async () => {
    console.log(`Servidor de SmartMark corriendo en http://localhost:${PORT}`);
    db = await initDB();
  });
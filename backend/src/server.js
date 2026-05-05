const express = require('express');
const cors = require('cors');
const initDB = require('./database/db');
const errorHandler = require('./middleware/errorHandler');

// Importar rutas
const bookmarksRouter = require('./routes/bookmarks');
const categoriesRouter = require('./routes/categories');
const tagsRouter = require('./routes/tags');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Variable que guarda la conexión a la BD
let db;

// Middleware para pasar la conexión a las rutas
app.use((req, res, next) => {
  req.app.locals.db = db;
  next();
});

// RUTAS
app.use('/api/links', bookmarksRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/tags', tagsRouter);

// LA RUTA RAÍZ
app.get('/', (req, res) => {
  res.send('¡Hola Mundo desde el backend de SmartMark!');
});

// Middleware de manejo de errores (debe estar al final)
app.use(errorHandler);

// ARRANQUE DEL SERVIDOR
app.listen(PORT, async () => {
  console.log(`Servidor de SmartMark corriendo en http://localhost:${PORT}`);
  db = await initDB();
  console.log('Base de datos inicializada correctamente');
});

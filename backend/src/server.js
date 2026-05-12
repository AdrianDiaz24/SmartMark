const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const initDB = require('./database/db');
const errorHandler = require('./middleware/errorHandler');

// Importar rutas
const bookmarksRouter = require('./routes/bookmarks');
const categoriesRouter = require('./routes/categories');
const tagsRouter = require('./routes/tags');

const app = express();
const PORT = 3000;

// Crear carpeta de uploads si no existe
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar multer para almacenar en memoria (ya que guardaremos en BD como BLOB)
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/png', 'image/jpeg', 'image/svg+xml'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Formato de archivo no permitido'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Variable que guarda la conexión a la BD
let db;

// Middleware para pasar la conexión a las rutas
app.use((req, res, next) => {
  req.app.locals.db = db;
  req.app.locals.upload = upload;
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

// Middleware de manejo de errores
app.use(errorHandler);

// ARRANQUE DEL SERVIDOR
app.listen(PORT, async () => {
  console.log(`Servidor de SmartMark corriendo en http://localhost:${PORT}`);
  db = await initDB();
  console.log('Base de datos inicializada correctamente');
});

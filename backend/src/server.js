/**
 * @fileoverview Servidor principal Express para la API de SmartMark
 * Configura todas las rutas, middleware y servicios necesarios
 * @module server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const initDB = require('./database/db');
const errorHandler = require('./middleware/errorHandler');
const { checkAndVerifyIfNeeded } = require('./config/cronJobConfig');

// Importar rutas
const bookmarksRouter = require('./routes/bookmarks');
const categoriesRouter = require('./routes/categories');
const tagsRouter = require('./routes/tags');
const urlVerificationRouter = require('./routes/urlVerification');

/** @constant {Object} app - Instancia de Express */
const app = express();

/** @constant {number} PORT - Puerto en el que escucha el servidor */
const PORT = process.env.PORT || 3000;

// Crear carpeta de uploads si no existe
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar multer para almacenar en memoria (ya que guardaremos en BD como BLOB)
const storage = multer.memoryStorage();

const maxFileSize = (process.env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024;

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
        fileSize: maxFileSize
    }
});

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true
}));
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
app.use('/api/url-verification', urlVerificationRouter);

// Ruta raíz de API
app.get('/api', (req, res) => {
  res.json({
    message: 'Bienvenido a la API de SmartMark',
    version: '1.0.0',
    endpoints: {
      links: '/api/links',
      categories: '/api/categories',
      tags: '/api/tags',
      urlVerification: '/api/url-verification'
    }
  });
});

// LA RUTA RAÍZ
app.get('/', (req, res) => {
  res.send('¡Hola Mundo desde el backend de SmartMark!');
});

// Middleware de manejo de errores
app.use(errorHandler);

// ARRANQUE DEL SERVIDOR
app.listen(PORT, async () => {
  console.log(`Servidor de SmartMark corriendo en http://localhost:${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
  db = await initDB();
  console.log('Base de datos inicializada correctamente');
  
  // Verificar si es necesario ejecutar verificación de URLs
  // (sistema adaptable para servidores autohosteados)
  try {
    await checkAndVerifyIfNeeded(db);
  } catch (error) {
    console.error('⚠Error en verificador de URLs:', error.message);
  }
});

-- V001__Initial_Schema.sql
-- Migración inicial: Creación del esquema completo de SmartMark

-- 1. TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS Usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE CATEGORÍAS
CREATE TABLE IF NOT EXISTS Categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    padre_id INTEGER,
    usuario_id INTEGER NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (padre_id) REFERENCES Categorias(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
);

-- 3. TABLA DE ETIQUETAS
CREATE TABLE IF NOT EXISTS Tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    color TEXT NOT NULL,
    usuario_id INTEGER NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    es_default BOOLEAN DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    UNIQUE (nombre, usuario_id)
);

-- 4. TABLA DE MARCADORES (Tus enlaces guardados)
CREATE TABLE IF NOT EXISTS Marcadores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    url TEXT NOT NULL,
    descripcion TEXT,
    portada BLOB,
    categoria_id INTEGER,
    usuario_id INTEGER NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_apertura DATETIME,
    github_stars INTEGER DEFAULT 0,
    github_forks INTEGER DEFAULT 0,
    github_watchers INTEGER DEFAULT 0,
    github_languages TEXT,
    url_estado TEXT DEFAULT 'desconocido',
    ultima_verificacion DATETIME,
    FOREIGN KEY (categoria_id) REFERENCES Categorias(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE
);

-- 5. TABLA INTERMEDIA (Relación Muchos a Muchos)
-- Empareja un Marcador con un Tag
CREATE TABLE IF NOT EXISTS Marcadores_Tags (
    marcador_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (marcador_id, tag_id),
    FOREIGN KEY (marcador_id) REFERENCES Marcadores(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
);

-- 6. TABLA INTERMEDIA (Relación Muchos a Muchos)
-- Empareja una Categoría con un Tag
CREATE TABLE IF NOT EXISTS Categorias_Tags (
    categoria_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (categoria_id, tag_id),
    FOREIGN KEY (categoria_id) REFERENCES Categorias(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES Tags(id) ON DELETE CASCADE
);

-- 7. TABLA DE LOG DE VERIFICACIÓN
-- Registra la última verificación de URLs
CREATE TABLE IF NOT EXISTS verification_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    last_verification DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'completed',
    marcadores_verificados INTEGER DEFAULT 0,
    marcadores_invalidos INTEGER DEFAULT 0,
    errores TEXT
);


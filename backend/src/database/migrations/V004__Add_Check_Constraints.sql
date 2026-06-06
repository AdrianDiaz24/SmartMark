
BEGIN TRANSACTION;

CREATE TABLE Marcadores_v2 (
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
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    CHECK (url_estado IN ('activo', 'inactivo', 'error', 'desconocido')),
    UNIQUE (url, usuario_id)
);

INSERT INTO Marcadores_v2 SELECT * FROM Marcadores;
DROP TABLE Marcadores;
ALTER TABLE Marcadores_v2 RENAME TO Marcadores;

COMMIT;

BEGIN TRANSACTION;

CREATE TABLE Categorias_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    padre_id INTEGER,
    usuario_id INTEGER NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (padre_id) REFERENCES Categorias(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    CHECK (LENGTH(TRIM(nombre)) > 0),
    UNIQUE (nombre, usuario_id)
);

INSERT INTO Categorias_v2 SELECT * FROM Categorias;
DROP TABLE Categorias;
ALTER TABLE Categorias_v2 RENAME TO Categorias;

COMMIT;

BEGIN TRANSACTION;

CREATE TABLE Usuarios_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    CHECK (email LIKE '%@%'),
    CHECK (LENGTH(username) >= 3)
);

INSERT INTO Usuarios_v2 SELECT * FROM Usuarios;
DROP TABLE Usuarios;
ALTER TABLE Usuarios_v2 RENAME TO Usuarios;

COMMIT;

BEGIN TRANSACTION;

CREATE TABLE Tags_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    color TEXT NOT NULL,
    usuario_id INTEGER NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    es_default BOOLEAN DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id) ON DELETE CASCADE,
    UNIQUE (nombre, usuario_id),
    CHECK (LENGTH(TRIM(nombre)) > 0)
);

INSERT INTO Tags_v2 SELECT * FROM Tags;
DROP TABLE Tags;
ALTER TABLE Tags_v2 RENAME TO Tags;

COMMIT;

BEGIN TRANSACTION;

CREATE TABLE verification_log_v2 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    last_verification DATETIME DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'completed',
    marcadores_verificados INTEGER DEFAULT 0,
    marcadores_invalidos INTEGER DEFAULT 0,
    errores TEXT,
    CHECK (status IN ('completed', 'pending', 'error'))
);

INSERT INTO verification_log_v2 SELECT * FROM verification_log;
DROP TABLE verification_log;
ALTER TABLE verification_log_v2 RENAME TO verification_log;

COMMIT;

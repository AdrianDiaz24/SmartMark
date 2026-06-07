-- V005: Corregir CHECK constraint para url_estado
-- Los valores deben ser 'valida', 'invalida' o 'desconocido'

BEGIN TRANSACTION;

-- Crear tabla temporal con el constraint correcto
CREATE TABLE Marcadores_v3 (
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
    CHECK (url_estado IN ('valida', 'invalida', 'desconocido')),
    UNIQUE (url, usuario_id)
);

-- Copiar datos con valores corregidos
INSERT INTO Marcadores_v3
SELECT
    id,
    titulo,
    url,
    descripcion,
    portada,
    categoria_id,
    usuario_id,
    fecha_creacion,
    ultima_apertura,
    github_stars,
    github_forks,
    github_watchers,
    github_languages,
    CASE
        WHEN url_estado = 'activo' THEN 'valida'
        WHEN url_estado = 'inactivo' THEN 'invalida'
        WHEN url_estado = 'error' THEN 'invalida'
        ELSE 'desconocido'
    END AS url_estado,
    ultima_verificacion
FROM Marcadores;

-- Reemplazar tabla original
DROP TABLE Marcadores;
ALTER TABLE Marcadores_v3 RENAME TO Marcadores;

COMMIT;


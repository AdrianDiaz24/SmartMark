-- V003: Agregar Índices

CREATE INDEX IF NOT EXISTS idx_usuarios_email ON Usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON Usuarios(username);
CREATE INDEX IF NOT EXISTS idx_categorias_usuario ON Categorias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_categorias_padre ON Categorias(padre_id);
CREATE INDEX IF NOT EXISTS idx_tags_usuario ON Tags(usuario_id);
CREATE INDEX IF NOT EXISTS idx_tags_nombre_usuario ON Tags(nombre, usuario_id);
CREATE INDEX IF NOT EXISTS idx_marcadores_usuario ON Marcadores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_marcadores_categoria ON Marcadores(categoria_id);
CREATE INDEX IF NOT EXISTS idx_marcadores_url_estado ON Marcadores(url_estado);
CREATE INDEX IF NOT EXISTS idx_marcadores_usuario_categoria ON Marcadores(usuario_id, categoria_id);
CREATE INDEX IF NOT EXISTS idx_marcadores_tags_tag ON Marcadores_Tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_categorias_tags_tag ON Categorias_Tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_verification_log_fecha ON verification_log(last_verification);


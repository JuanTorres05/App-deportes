-- Alter Table: usuarios (Add search radius, location, and location update timestamp)
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS radio_busqueda_km INT DEFAULT 5;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ubicacion GEOGRAPHY(Point, 4326);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ubicacion_actualizada_en TIMESTAMP WITH TIME ZONE;

-- Create GIST Spatial Index on usuarios.ubicacion for fast radius proximity queries
CREATE INDEX IF NOT EXISTS idx_usuarios_ubicacion ON usuarios USING GIST (ubicacion);

-- Alter Table: perfiles_deportivos (Add active online status toggle)
ALTER TABLE perfiles_deportivos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT false;

-- Create Table: perfil_fotos (Photo gallery with video ready tipo column)
CREATE TABLE IF NOT EXISTS perfil_fotos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    url VARCHAR(1000) NOT NULL,
    tipo VARCHAR(20) NOT NULL DEFAULT 'FOTO',
    orden INT NOT NULL DEFAULT 0,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for fast user gallery fetching
CREATE INDEX IF NOT EXISTS idx_perfil_fotos_usuario_id ON perfil_fotos(usuario_id);

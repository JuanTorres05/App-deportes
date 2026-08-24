-- =====================================================================
-- Sprint 2 Migration: Ratings (3 criteria) + Match Participants + Teams
-- =====================================================================

-- 1. Alter table: partidos — add scheduling fields and required skill level
ALTER TABLE partidos ADD COLUMN IF NOT EXISTS fecha DATE;
ALTER TABLE partidos ADD COLUMN IF NOT EXISTS hora_inicio VARCHAR(10);
ALTER TABLE partidos ADD COLUMN IF NOT EXISTS hora_fin VARCHAR(10);
ALTER TABLE partidos ADD COLUMN IF NOT EXISTS nivel_requerido VARCHAR(50);

-- 2. Create table: partido_jugadores — tracks participants in each match
--    Required for validating "both users played together" before allowing ratings
CREATE TABLE IF NOT EXISTS partido_jugadores (
    partido_id UUID NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    unido_en   TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (partido_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_partido_jugadores_usuario_id ON partido_jugadores(usuario_id);

-- 3. Alter table: calificaciones — replace single puntuacion with 3 criteria
--    The original puntuacion column is renamed and supplemented with granular fields
ALTER TABLE calificaciones RENAME COLUMN puntuacion TO puntuacion_juego;
ALTER TABLE calificaciones ADD COLUMN IF NOT EXISTS puntuacion_puntualidad INT;
ALTER TABLE calificaciones ADD COLUMN IF NOT EXISTS puntuacion_actitud INT;

-- Add CHECK constraints for each score (must be 1-5)
ALTER TABLE calificaciones
    ADD CONSTRAINT chk_puntuacion_juego CHECK (puntuacion_juego >= 1 AND puntuacion_juego <= 5);
ALTER TABLE calificaciones
    ADD CONSTRAINT chk_puntuacion_puntualidad CHECK (puntuacion_puntualidad >= 1 AND puntuacion_puntualidad <= 5);
ALTER TABLE calificaciones
    ADD CONSTRAINT chk_puntuacion_actitud CHECK (puntuacion_actitud >= 1 AND puntuacion_actitud <= 5);

-- Prevent duplicate ratings: same rater cannot rate same person in same match twice
ALTER TABLE calificaciones
    ADD CONSTRAINT uq_calificacion_partido_par
    UNIQUE (partido_id, usuario_calificador_id, usuario_calificado_id);

-- 4. Alter table: equipos — add sport and optional team photo
ALTER TABLE equipos ADD COLUMN IF NOT EXISTS deporte VARCHAR(50);
ALTER TABLE equipos ADD COLUMN IF NOT EXISTS foto_url VARCHAR(1000);

-- 5. Alter table: equipo_miembros — add invitation state tracking
ALTER TABLE equipo_miembros ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'PENDIENTE';
ALTER TABLE equipo_miembros ADD COLUMN IF NOT EXISTS invitado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Update existing rows (if any) to ACEPTADO since they were created without invitation flow
UPDATE equipo_miembros SET estado = 'ACEPTADO' WHERE estado IS NULL OR estado = 'MIEMBRO';

CREATE INDEX IF NOT EXISTS idx_equipo_miembros_usuario_estado
    ON equipo_miembros(usuario_id, estado);

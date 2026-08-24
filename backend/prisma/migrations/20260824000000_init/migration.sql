-- Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create Table: usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    foto_url VARCHAR(1000),
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Table: perfiles_deportivos
CREATE TABLE perfiles_deportivos (
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    deporte VARCHAR(50) NOT NULL,
    posicion VARCHAR(50),
    nivel VARCHAR(50),
    PRIMARY KEY (usuario_id, deporte)
);

-- Create Table: equipos
CREATE TABLE equipos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    creado_por UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Table: equipo_miembros
CREATE TABLE equipo_miembros (
    equipo_id UUID NOT NULL REFERENCES equipos(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    rol VARCHAR(50) NOT NULL DEFAULT 'MIEMBRO',
    PRIMARY KEY (equipo_id, usuario_id)
);

-- Create Table: centros_deportivos
CREATE TABLE centros_deportivos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    usuario_admin_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Create Table: canchas
CREATE TABLE canchas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    centro_deportivo_id UUID NOT NULL REFERENCES centros_deportivos(id) ON DELETE CASCADE,
    ubicacion GEOGRAPHY(Point, 4326),
    tipo VARCHAR(50) NOT NULL,
    precio_hora DECIMAL(10, 2) NOT NULL
);

-- Create GIST spatial index on canchas.ubicacion for fast proximity search (radius queries)
CREATE INDEX idx_canchas_ubicacion ON canchas USING GIST (ubicacion);

-- Create Table: reservas
CREATE TABLE reservas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cancha_id UUID NOT NULL REFERENCES canchas(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    hora_inicio VARCHAR(10) NOT NULL,
    hora_fin VARCHAR(10) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'PENDIENTE'
);

-- Create Table: partidos
CREATE TABLE partidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deporte VARCHAR(50) NOT NULL,
    estado VARCHAR(50) NOT NULL DEFAULT 'PROGRAMADO',
    organizador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    cancha_id UUID REFERENCES canchas(id) ON DELETE SET NULL
);

-- Create Table: calificaciones
CREATE TABLE calificaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partido_id UUID NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
    usuario_calificado_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    usuario_calificador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    puntuacion INT NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
    comentario TEXT
);

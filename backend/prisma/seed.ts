import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando carga de datos semilla (Seed Data)...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Limpiar datos existentes (opcional pero seguro)
  await prisma.calificacion.deleteMany({});
  await prisma.partidoJugador.deleteMany({});
  await prisma.partido.deleteMany({});
  await prisma.reserva.deleteMany({});
  await prisma.cancha.deleteMany({});
  await prisma.centroDeportivo.deleteMany({});
  await prisma.equipoMiembro.deleteMany({});
  await prisma.equipo.deleteMany({});
  await prisma.perfilDeportivo.deleteMany({});
  await prisma.perfilFoto.deleteMany({});
  await prisma.usuario.deleteMany({});

  // 2. Crear Usuarios Demo
  console.log('👤 Creando usuarios demo...');
  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Admin Centro Deportivo',
      email: 'admin@playconnect.com',
      password_hash: passwordHash,
      foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      radio_busqueda_km: 15,
    },
  });

  const carlos = await prisma.usuario.create({
    data: {
      nombre: 'Carlos Rodríguez',
      email: 'carlos@playconnect.com',
      password_hash: passwordHash,
      foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      radio_busqueda_km: 10,
    },
  });

  const mateo = await prisma.usuario.create({
    data: {
      nombre: 'Mateo Gómez',
      email: 'mateo@playconnect.com',
      password_hash: passwordHash,
      foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      radio_busqueda_km: 8,
    },
  });

  const sofia = await prisma.usuario.create({
    data: {
      nombre: 'Sofía Martínez',
      email: 'sofia@playconnect.com',
      password_hash: passwordHash,
      foto_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
      radio_busqueda_km: 12,
    },
  });

  // Asignar ubicaciones PostGIS
  await prisma.$executeRawUnsafe(
    `UPDATE usuarios SET ubicacion = ST_SetSRID(ST_MakePoint(-74.0817, 4.6097), 4326), ubicacion_actualizada_en = NOW() WHERE id = '${carlos.id}'::uuid;`
  );
  await prisma.$executeRawUnsafe(
    `UPDATE usuarios SET ubicacion = ST_SetSRID(ST_MakePoint(-74.0750, 4.6150), 4326), ubicacion_actualizada_en = NOW() WHERE id = '${mateo.id}'::uuid;`
  );
  await prisma.$executeRawUnsafe(
    `UPDATE usuarios SET ubicacion = ST_SetSRID(ST_MakePoint(-74.0900, 4.6200), 4326), ubicacion_actualizada_en = NOW() WHERE id = '${sofia.id}'::uuid;`
  );

  // 3. Crear Perfiles Deportivos
  console.log('⚽ Creando perfiles deportivos...');
  await prisma.perfilDeportivo.createMany({
    data: [
      { usuario_id: carlos.id, deporte: 'FUTBOL', posicion: 'DELANTERO', nivel: 'AVANZADO', activo: true },
      { usuario_id: carlos.id, deporte: 'PADEL', posicion: 'DRIVE', nivel: 'INTERMEDIO', activo: false },
      { usuario_id: mateo.id, deporte: 'PADEL', posicion: 'REVES', nivel: 'AVANZADO', activo: true },
      { usuario_id: mateo.id, deporte: 'FUTBOL', posicion: 'MEDIOCAMPISTA', nivel: 'INTERMEDIO', activo: false },
      { usuario_id: sofia.id, deporte: 'TENIS', posicion: 'DRIVE', nivel: 'INTERMEDIO', activo: true },
      { usuario_id: sofia.id, deporte: 'FUTBOL', posicion: 'DEFENSA', nivel: 'PRINCIPIANTE', activo: true },
    ],
  });

  // 4. Crear Centros Deportivos y Canchas
  console.log('🏟️ Creando centros deportivos y canchas...');
  const centro1 = await prisma.centroDeportivo.create({
    data: {
      nombre: 'Complejo Deportivo El Campín',
      usuario_admin_id: admin.id,
    },
  });

  const centro2 = await prisma.centroDeportivo.create({
    data: {
      nombre: 'Club de Raqueta & Tenis Los Andes',
      usuario_admin_id: admin.id,
    },
  });

  const canchaFutbol1 = await prisma.cancha.create({
    data: {
      nombre: 'Cancha Sintética Fútbol 7 - Principal',
      centro_deportivo_id: centro1.id,
      tipo: 'FUTBOL',
      precio_hora: 70000,
    },
  });

  const canchaFutbol2 = await prisma.cancha.create({
    data: {
      nombre: 'Cancha Sintética Fútbol 5 - Iluminada',
      centro_deportivo_id: centro1.id,
      tipo: 'FUTBOL',
      precio_hora: 55000,
    },
  });

  const canchaPadel = await prisma.cancha.create({
    data: {
      nombre: 'Pista de Pádel Cristal Panorámica A',
      centro_deportivo_id: centro2.id,
      tipo: 'PADEL',
      precio_hora: 50000,
    },
  });

  const canchaTenis = await prisma.cancha.create({
    data: {
      nombre: 'Cancha de Tenis Polvo de Ladrillo #1',
      centro_deportivo_id: centro2.id,
      tipo: 'TENIS',
      precio_hora: 45000,
    },
  });

  // Asignar ubicaciones PostGIS a las canchas
  await prisma.$executeRawUnsafe(
    `UPDATE canchas SET ubicacion = ST_SetSRID(ST_MakePoint(-74.0770, 4.6460), 4326) WHERE id = '${canchaFutbol1.id}'::uuid;`
  );
  await prisma.$executeRawUnsafe(
    `UPDATE canchas SET ubicacion = ST_SetSRID(ST_MakePoint(-74.0775, 4.6465), 4326) WHERE id = '${canchaFutbol2.id}'::uuid;`
  );
  await prisma.$executeRawUnsafe(
    `UPDATE canchas SET ubicacion = ST_SetSRID(ST_MakePoint(-74.0620, 4.6600), 4326) WHERE id = '${canchaPadel.id}'::uuid;`
  );
  await prisma.$executeRawUnsafe(
    `UPDATE canchas SET ubicacion = ST_SetSRID(ST_MakePoint(-74.0625, 4.6605), 4326) WHERE id = '${canchaTenis.id}'::uuid;`
  );

  // 5. Crear Equipos Demo
  console.log('🛡️ Creando equipos demo...');
  const equipoGalacticos = await prisma.equipo.create({
    data: {
      nombre: 'Los Galácticos FC',
      deporte: 'FUTBOL',
      creado_por: carlos.id,
      foto_url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400',
      miembros: {
        create: [
          { usuario_id: carlos.id, rol: 'CAPITAN', estado: 'ACEPTADA' },
          { usuario_id: mateo.id, rol: 'MIEMBRO', estado: 'ACEPTADA' },
          { usuario_id: sofia.id, rol: 'MIEMBRO', estado: 'ACEPTADA' },
        ],
      },
    },
  });

  const equipoPadelStars = await prisma.equipo.create({
    data: {
      nombre: 'Pádel Stars',
      deporte: 'PADEL',
      creado_por: mateo.id,
      foto_url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400',
      miembros: {
        create: [
          { usuario_id: mateo.id, rol: 'CAPITAN', estado: 'ACEPTADA' },
          { usuario_id: carlos.id, rol: 'MIEMBRO', estado: 'ACEPTADA' },
        ],
      },
    },
  });

  // 6. Crear Partidos Abiertos
  console.log('⚽ Creando partidos demo...');
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const partido1 = await prisma.partido.create({
    data: {
      deporte: 'FUTBOL',
      estado: 'BUSCANDO_GENTE',
      organizador_id: carlos.id,
      cancha_id: canchaFutbol1.id,
      fecha: tomorrow,
      hora_inicio: '19:00',
      hora_fin: '20:30',
      nivel_requerido: 'INTERMEDIO',
      jugadores: {
        create: [
          { usuario_id: carlos.id },
          { usuario_id: mateo.id },
        ],
      },
    },
  });

  const partidoPadel = await prisma.partido.create({
    data: {
      deporte: 'PADEL',
      estado: 'BUSCANDO_GENTE',
      organizador_id: mateo.id,
      cancha_id: canchaPadel.id,
      fecha: tomorrow,
      hora_inicio: '18:00',
      hora_fin: '19:30',
      nivel_requerido: 'AVANZADO',
      jugadores: {
        create: [
          { usuario_id: mateo.id },
        ],
      },
    },
  });

  // 7. Crear Reservas de Ejemplo
  console.log('📅 Creando reservas confirmadas...');
  await prisma.reserva.create({
    data: {
      cancha_id: canchaFutbol1.id,
      usuario_id: carlos.id,
      fecha: tomorrow,
      hora_inicio: '19:00',
      hora_fin: '20:30',
      estado: 'CONFIRMADA',
    },
  });

  await prisma.reserva.create({
    data: {
      cancha_id: canchaPadel.id,
      usuario_id: mateo.id,
      fecha: tomorrow,
      hora_inicio: '18:00',
      hora_fin: '19:30',
      estado: 'CONFIRMADA',
    },
  });

  // 8. Crear Calificaciones de Ejemplo
  console.log('⭐ Creando calificaciones de ejemplo...');
  await prisma.calificacion.create({
    data: {
      partido_id: partido1.id,
      usuario_calificador_id: mateo.id,
      usuario_calificado_id: carlos.id,
      puntuacion_juego: 5,
      puntuacion_puntualidad: 5,
      puntuacion_actitud: 5,
      comentario: '¡Excelente jugador y muy puntual!',
    },
  });

  await prisma.calificacion.create({
    data: {
      partido_id: partido1.id,
      usuario_calificador_id: carlos.id,
      usuario_calificado_id: mateo.id,
      puntuacion_juego: 4,
      puntuacion_puntualidad: 5,
      puntuacion_actitud: 5,
      comentario: 'Gran compañero de equipo, muy buena actitud.',
    },
  });

  console.log('✅ ¡Carga de datos semilla completada con éxito!');
  console.log('----------------------------------------------------');
  console.log('Cuentas creadas para pruebas:');
  console.log('  1. admin@playconnect.com / Password123! (Admin Complejos)');
  console.log('  2. carlos@playconnect.com / Password123! (Fútbol Delantero)');
  console.log('  3. mateo@playconnect.com / Password123! (Pádel / Capitán)');
  console.log('  4. sofia@playconnect.com / Password123! (Tenis / Fútbol)');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error al ejecutar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

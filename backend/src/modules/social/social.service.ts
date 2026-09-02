import { prisma } from '../../lib/prisma';
import { AppError } from '../auth/auth.service';

export class SocialService {
  static async getPublicProfile(targetUserId: string) {
    const user = await prisma.usuario.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        nombre: true,
        foto_url: true,
        equipo_miembros: {
          include: {
            equipo: {
              select: { id: true, nombre: true, deporte: true },
            },
          },
        },
        partido_jugadores: {
          include: {
            partido: {
              select: { id: true, deporte: true, estado: true, fecha: true },
            },
          },
        },
        calificaciones_recibidas: {
          select: {
            puntuacion_juego: true,
            puntuacion_puntualidad: true,
            puntuacion_actitud: true,
          },
        },
      },
    });

    if (!user) throw new AppError('Jugador no encontrado', 404);

    const totalRatings = user.calificaciones_recibidas.length;
    const avgJuego =
      totalRatings > 0
        ? user.calificaciones_recibidas.reduce((s, r) => s + r.puntuacion_juego, 0) / totalRatings
        : 0;
    const avgPuntualidad =
      totalRatings > 0
        ? user.calificaciones_recibidas.reduce((s, r) => s + r.puntuacion_puntualidad, 0) / totalRatings
        : 0;
    const avgActitud =
      totalRatings > 0
        ? user.calificaciones_recibidas.reduce((s, r) => s + r.puntuacion_actitud, 0) / totalRatings
        : 0;

    const totalPartidos = user.partido_jugadores.length;
    const partidosFinalizados = user.partido_jugadores.filter(
      (pj) => pj.partido.estado === 'FINALIZADO',
    ).length;

    const equipos = user.equipo_miembros.map((em) => ({
      id: em.equipo.id,
      nombre: em.equipo.nombre,
      deporte: em.equipo.deporte,
    }));

    return {
      id: user.id,
      nombre: user.nombre,
      foto_url: user.foto_url,
      estadisticas: {
        total_partidos: totalPartidos,
        partidos_finalizados: partidosFinalizados,
        total_calificaciones: totalRatings,
        promedio_juego: Math.round(avgJuego * 10) / 10,
        promedio_puntualidad: Math.round(avgPuntualidad * 10) / 10,
        promedio_actitud: Math.round(avgActitud * 10) / 10,
      },
      equipos,
    };
  }

  static async getActivityFeed(_userId: string) {
    const [recentMatches, recentReservas] = await Promise.all([
      prisma.partido.findMany({
        orderBy: { fecha: 'desc' },
        take: 10,
        include: {
          organizador: { select: { nombre: true } },
        },
      }),
      prisma.reserva.findMany({
        orderBy: { fecha: 'desc' },
        take: 10,
        include: {
          usuario: { select: { nombre: true } },
          cancha: { select: { nombre: true } },
        },
      }),
    ]);

    const feedItems: Array<{
      id: string;
      tipo: string;
      icono: string;
      titulo: string;
      subtitulo: string;
      fecha: Date | null;
      ref_id: string;
    }> = [];

    recentMatches.forEach((m) => {
      feedItems.push({
        id: `match_${m.id}`,
        tipo: 'PARTIDO',
        icono: '⚽',
        titulo: `Partido de ${m.deporte}`,
        subtitulo: `Organizado por ${m.organizador.nombre} · Estado: ${m.estado}`,
        fecha: m.fecha,
        ref_id: m.id,
      });
    });

    recentReservas.forEach((r) => {
      feedItems.push({
        id: `reserva_${r.id}`,
        tipo: 'RESERVA',
        icono: '📅',
        titulo: `Turno reservado: ${r.cancha.nombre}`,
        subtitulo: `Por ${r.usuario.nombre} · ${r.hora_inicio} – ${r.hora_fin}`,
        fecha: r.fecha,
        ref_id: r.id,
      });
    });

    // Sort descending by date (nulls last)
    feedItems.sort((a, b) => {
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
    });

    return feedItems.slice(0, 20);
  }
}

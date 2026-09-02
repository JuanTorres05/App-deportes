import { prisma } from '../../lib/prisma';
import { AppError } from '../auth/auth.service';

interface RatingStats {
  total_calificaciones: number;
  promedio_juego: number;
  promedio_puntualidad: number;
  promedio_actitud: number;
  promedio_global: number;
}

interface MyStats {
  usuario: {
    id: string;
    nombre: string;
    foto_url: string | null;
  };
  calificaciones: RatingStats;
  partidos: {
    total_organizados: number;
    total_participados: number;
  };
  equipos: {
    total_creados: number;
    total_miembro: number;
  };
  deportes: string[];
}

interface LeaderboardEntry {
  posicion: number;
  usuario_id: string;
  nombre: string;
  foto_url: string | null;
  promedio_global: number;
  promedio_juego: number;
  promedio_puntualidad: number;
  promedio_actitud: number;
  total_calificaciones: number;
}

export class StatsService {
  static async getMyStats(userId: string): Promise<MyStats> {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      include: {
        perfiles_deportivos: true,
        calificaciones_recibidas: true,
        partido_jugadores: { include: { partido: true } },
        equipo_miembros: true,
        equipos_creados: true,
      },
    });

    if (!user) throw new AppError('Usuario no encontrado', 404);

    const ratings = user.calificaciones_recibidas;
    const totalRatings = ratings.length;

    const avgJuego =
      totalRatings > 0
        ? parseFloat(
            (ratings.reduce((sum, r) => sum + r.puntuacion_juego, 0) / totalRatings).toFixed(2),
          )
        : 0;

    const avgPuntualidad =
      totalRatings > 0
        ? parseFloat(
            (
              ratings.reduce((sum, r) => sum + r.puntuacion_puntualidad, 0) / totalRatings
            ).toFixed(2),
          )
        : 0;

    const avgActitud =
      totalRatings > 0
        ? parseFloat(
            (ratings.reduce((sum, r) => sum + r.puntuacion_actitud, 0) / totalRatings).toFixed(2),
          )
        : 0;

    const avgGlobal =
      totalRatings > 0
        ? parseFloat(((avgJuego + avgPuntualidad + avgActitud) / 3).toFixed(2))
        : 0;

    const deportes = [...new Set(user.perfiles_deportivos.map((p) => p.deporte))];

    const totalOrganizados = await prisma.partido.count({
      where: { organizador_id: userId },
    });

    return {
      usuario: {
        id: user.id,
        nombre: user.nombre,
        foto_url: user.foto_url,
      },
      calificaciones: {
        total_calificaciones: totalRatings,
        promedio_juego: avgJuego,
        promedio_puntualidad: avgPuntualidad,
        promedio_actitud: avgActitud,
        promedio_global: avgGlobal,
      },
      partidos: {
        total_organizados: totalOrganizados,
        total_participados: user.partido_jugadores.length,
      },
      equipos: {
        total_creados: user.equipos_creados.length,
        total_miembro: user.equipo_miembros.length,
      },
      deportes,
    };
  }

  static async getLeaderboard(): Promise<LeaderboardEntry[]> {
    // Aggregate ratings per user using Prisma groupBy
    const grouped = await prisma.calificacion.groupBy({
      by: ['usuario_calificado_id'],
      _avg: {
        puntuacion_juego: true,
        puntuacion_puntualidad: true,
        puntuacion_actitud: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _avg: {
          puntuacion_juego: 'desc',
        },
      },
      take: 10,
    });

    if (grouped.length === 0) return [];

    // Fetch user details for each top entry
    const userIds = grouped.map((g) => g.usuario_calificado_id);
    const users = await prisma.usuario.findMany({
      where: { id: { in: userIds } },
      select: { id: true, nombre: true, foto_url: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    const leaderboard: LeaderboardEntry[] = grouped
      .map((g) => {
        const avgJuego = parseFloat((g._avg.puntuacion_juego ?? 0).toFixed(2));
        const avgPuntualidad = parseFloat((g._avg.puntuacion_puntualidad ?? 0).toFixed(2));
        const avgActitud = parseFloat((g._avg.puntuacion_actitud ?? 0).toFixed(2));
        const avgGlobal = parseFloat(((avgJuego + avgPuntualidad + avgActitud) / 3).toFixed(2));
        const u = userMap.get(g.usuario_calificado_id);

        return {
          posicion: 0,
          usuario_id: g.usuario_calificado_id,
          nombre: u?.nombre ?? 'Desconocido',
          foto_url: u?.foto_url ?? null,
          promedio_global: avgGlobal,
          promedio_juego: avgJuego,
          promedio_puntualidad: avgPuntualidad,
          promedio_actitud: avgActitud,
          total_calificaciones: g._count.id,
        };
      })
      .sort((a, b) => b.promedio_global - a.promedio_global)
      .map((entry, idx) => ({ ...entry, posicion: idx + 1 }));

    return leaderboard;
  }
}

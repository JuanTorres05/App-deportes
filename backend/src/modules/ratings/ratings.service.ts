import { prisma } from '../../lib/prisma';
import { AppError } from '../auth/auth.service';
import { SubmitRatingDto } from './dto/ratings.dto';

export interface RatingAverage {
  usuario_id: string;
  nombre: string;
  foto_url: string | null;
  promedio_juego: number | null;
  promedio_puntualidad: number | null;
  promedio_actitud: number | null;
  promedio_general: number | null;
  total_calificaciones: number;
}

export class RatingsService {
  static async submitRating(calificadorId: string, dto: SubmitRatingDto) {
    // Rule 1: Cannot rate yourself
    if (calificadorId === dto.usuario_calificado_id) {
      throw new AppError('No puedes calificarte a ti mismo', 400);
    }

    // Rule 2: Both users must have participated in the match
    const [raterInMatch, ratedInMatch] = await Promise.all([
      prisma.partidoJugador.findUnique({
        where: { partido_id_usuario_id: { partido_id: dto.partido_id, usuario_id: calificadorId } },
      }),
      prisma.partidoJugador.findUnique({
        where: { partido_id_usuario_id: { partido_id: dto.partido_id, usuario_id: dto.usuario_calificado_id } },
      }),
    ]);

    if (!raterInMatch) {
      throw new AppError('No eres participante de este partido', 403);
    }
    if (!ratedInMatch) {
      throw new AppError('El usuario a calificar no es participante de este partido', 400);
    }

    // Rule 3: Match must be in JUGADO state
    const match = await prisma.partido.findUnique({ where: { id: dto.partido_id } });
    if (!match) throw new AppError('Partido no encontrado', 404);
    if (match.estado !== 'JUGADO' && match.estado !== 'CALIFICADO') {
      throw new AppError('Solo puedes calificar partidos ya jugados', 400);
    }

    // Rule 4: No duplicate rating (enforced by DB unique constraint, caught below)
    try {
      const rating = await prisma.calificacion.create({
        data: {
          partido_id: dto.partido_id,
          usuario_calificado_id: dto.usuario_calificado_id,
          usuario_calificador_id: calificadorId,
          puntuacion_juego: dto.puntuacion_juego,
          puntuacion_puntualidad: dto.puntuacion_puntualidad,
          puntuacion_actitud: dto.puntuacion_actitud,
          comentario: dto.comentario ?? null,
        },
      });

      // Auto-advance match to CALIFICADO if all participants have rated all others
      await RatingsService.checkAndAdvanceMatchState(dto.partido_id);

      return rating;
    } catch (error: unknown) {
      // Unique constraint violation (Prisma error code P2002)
      const err = error as { code?: string };
      if (err.code === 'P2002') {
        throw new AppError('Ya calificaste a este jugador en este partido', 400);
      }
      throw error;
    }
  }

  private static async checkAndAdvanceMatchState(partidoId: string) {
    const jugadores = await prisma.partidoJugador.findMany({
      where: { partido_id: partidoId },
      select: { usuario_id: true },
    });

    if (jugadores.length < 2) return;

    const totalExpected = jugadores.length * (jugadores.length - 1); // Each rates all others
    const totalDone = await prisma.calificacion.count({ where: { partido_id: partidoId } });

    if (totalDone >= totalExpected) {
      await prisma.partido.update({
        where: { id: partidoId },
        data: { estado: 'CALIFICADO' },
      });
    }
  }

  static async getUserRatingAverage(userId: string): Promise<RatingAverage> {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, nombre: true, foto_url: true },
    });
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const result = await prisma.calificacion.aggregate({
      where: { usuario_calificado_id: userId },
      _avg: {
        puntuacion_juego: true,
        puntuacion_puntualidad: true,
        puntuacion_actitud: true,
      },
      _count: { id: true },
    });

    const avg = result._avg;
    const promedio_general =
      avg.puntuacion_juego && avg.puntuacion_puntualidad && avg.puntuacion_actitud
        ? Math.round(((avg.puntuacion_juego + avg.puntuacion_puntualidad + avg.puntuacion_actitud) / 3) * 10) / 10
        : null;

    return {
      usuario_id: user.id,
      nombre: user.nombre,
      foto_url: user.foto_url,
      promedio_juego: avg.puntuacion_juego ? Math.round(avg.puntuacion_juego * 10) / 10 : null,
      promedio_puntualidad: avg.puntuacion_puntualidad ? Math.round(avg.puntuacion_puntualidad * 10) / 10 : null,
      promedio_actitud: avg.puntuacion_actitud ? Math.round(avg.puntuacion_actitud * 10) / 10 : null,
      promedio_general,
      total_calificaciones: result._count.id,
    };
  }

  static async getMatchRatings(partidoId: string, userId: string) {
    return prisma.calificacion.findMany({
      where: { partido_id: partidoId, usuario_calificador_id: userId },
      select: {
        id: true,
        puntuacion_juego: true,
        puntuacion_puntualidad: true,
        puntuacion_actitud: true,
        comentario: true,
        usuario_calificado: { select: { id: true, nombre: true, foto_url: true } },
      },
    });
  }
}

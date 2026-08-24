import { prisma } from '../../lib/prisma';
import { AppError } from '../auth/auth.service';
import { CreateMatchDto, AddParticipantDto } from './dto/matches.dto';

const VALID_TRANSITIONS: Record<string, string> = {
  BUSCANDO_GENTE: 'COMPLETO',
  COMPLETO: 'CONFIRMADO',
  CONFIRMADO: 'JUGADO',
  JUGADO: 'CALIFICADO',
};

export class MatchesService {
  static async createMatch(organizadorId: string, dto: CreateMatchDto) {
    const match = await prisma.$transaction(async (tx) => {
      const newMatch = await tx.partido.create({
        data: {
          deporte: dto.deporte.toUpperCase(),
          organizador_id: organizadorId,
          estado: 'BUSCANDO_GENTE',
          fecha: dto.fecha ? new Date(dto.fecha) : null,
          hora_inicio: dto.hora_inicio ?? null,
          hora_fin: dto.hora_fin ?? null,
          nivel_requerido: dto.nivel_requerido ?? null,
        },
      });

      // Auto-add organizer as first participant
      await tx.partidoJugador.create({
        data: { partido_id: newMatch.id, usuario_id: organizadorId },
      });

      return newMatch;
    });

    return match;
  }

  static async addParticipant(partidoId: string, requesterId: string, dto: AddParticipantDto) {
    const match = await prisma.partido.findUnique({ where: { id: partidoId } });
    if (!match) throw new AppError('Partido no encontrado', 404);

    // Only organizer can add participants (until self-join is implemented in Sprint 3)
    if (match.organizador_id !== requesterId) {
      throw new AppError('Solo el organizador puede agregar participantes', 403);
    }

    const existing = await prisma.partidoJugador.findUnique({
      where: { partido_id_usuario_id: { partido_id: partidoId, usuario_id: dto.usuario_id } },
    });
    if (existing) throw new AppError('El usuario ya es participante de este partido', 400);

    return prisma.partidoJugador.create({
      data: { partido_id: partidoId, usuario_id: dto.usuario_id },
    });
  }

  static async markAsPlayed(partidoId: string, requesterId: string) {
    const match = await prisma.partido.findUnique({ where: { id: partidoId } });
    if (!match) throw new AppError('Partido no encontrado', 404);

    if (match.organizador_id !== requesterId) {
      throw new AppError('Solo el organizador puede marcar el partido como jugado', 403);
    }

    if (match.estado === 'JUGADO' || match.estado === 'CALIFICADO') {
      throw new AppError(`El partido ya está en estado ${match.estado}`, 400);
    }

    // Advance state machine to JUGADO directly (simulating real booking flow)
    return prisma.partido.update({
      where: { id: partidoId },
      data: { estado: 'JUGADO' },
    });
  }

  static async advanceState(partidoId: string, requesterId: string) {
    const match = await prisma.partido.findUnique({ where: { id: partidoId } });
    if (!match) throw new AppError('Partido no encontrado', 404);
    if (match.organizador_id !== requesterId) {
      throw new AppError('Solo el organizador puede avanzar el estado', 403);
    }

    const nextState = VALID_TRANSITIONS[match.estado];
    if (!nextState) throw new AppError(`No hay siguiente estado para ${match.estado}`, 400);

    return prisma.partido.update({
      where: { id: partidoId },
      data: { estado: nextState },
    });
  }

  static async getMatchHistory(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [matches, total] = await Promise.all([
      prisma.partido.findMany({
        where: {
          jugadores: { some: { usuario_id: userId } },
        },
        include: {
          organizador: { select: { id: true, nombre: true, foto_url: true } },
          jugadores: { include: { usuario: { select: { id: true, nombre: true, foto_url: true } } } },
          calificaciones: {
            where: { usuario_calificador_id: userId },
            select: { id: true, usuario_calificado_id: true },
          },
        },
        orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.partido.count({
        where: { jugadores: { some: { usuario_id: userId } } },
      }),
    ]);

    const matchesWithRatingStatus = matches.map((m) => {
      const otherParticipants = m.jugadores
        .filter((j) => j.usuario_id !== userId)
        .map((j) => j.usuario);

      const ratedIds = new Set(m.calificaciones.map((c) => c.usuario_calificado_id));
      const pendingRatings = otherParticipants.filter((p) => !ratedIds.has(p.id));

      return {
        id: m.id,
        deporte: m.deporte,
        estado: m.estado,
        fecha: m.fecha,
        hora_inicio: m.hora_inicio,
        hora_fin: m.hora_fin,
        nivel_requerido: m.nivel_requerido,
        organizador: m.organizador,
        participantes: otherParticipants,
        puede_calificar: m.estado === 'JUGADO' && pendingRatings.length > 0,
        pendiente_calificar: pendingRatings,
      };
    });

    return {
      matches: matchesWithRatingStatus,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  static async getMatchById(partidoId: string) {
    const match = await prisma.partido.findUnique({
      where: { id: partidoId },
      include: {
        organizador: { select: { id: true, nombre: true, foto_url: true } },
        jugadores: { include: { usuario: { select: { id: true, nombre: true, foto_url: true } } } },
      },
    });
    if (!match) throw new AppError('Partido no encontrado', 404);
    return match;
  }
}

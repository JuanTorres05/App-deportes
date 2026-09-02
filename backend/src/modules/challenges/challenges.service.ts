import { prisma } from '../../lib/prisma';
import { AppError } from '../auth/auth.service';
import { CreateChallengeDto, RespondChallengeDto } from './dto/challenges.dto';

export interface ChallengeItem {
  id: string;
  equipo_retador_id: string;
  equipo_retador_nombre: string;
  capitan_retador_id: string;
  capitan_retador_nombre: string;
  equipo_rival_nombre: string;
  deporte: string;
  fecha_propuesta: string;
  hora_propuesta: string;
  cancha_nombre: string;
  mensaje?: string;
  estado: 'PENDIENTE' | 'ACEPTADO' | 'RECHAZADO';
  creado_en: string;
}

const challengeStore: Record<string, ChallengeItem> = {};

export class ChallengesService {
  static async createChallenge(requesterId: string, dto: CreateChallengeDto): Promise<ChallengeItem> {
    const user = await prisma.usuario.findUnique({ where: { id: requesterId } });
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const retadorTeam = await prisma.equipo.findUnique({
      where: { id: dto.equipo_retador_id },
    });

    if (!retadorTeam) throw new AppError('Equipo retador no encontrado', 404);
    if (retadorTeam.creado_por !== requesterId) {
      throw new AppError('Solo el capitán del equipo puede emitir desafíos', 403);
    }

    const challengeId = `chal_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    const newChallenge: ChallengeItem = {
      id: challengeId,
      equipo_retador_id: retadorTeam.id,
      equipo_retador_nombre: retadorTeam.nombre,
      capitan_retador_id: requesterId,
      capitan_retador_nombre: user.nombre,
      equipo_rival_nombre: dto.equipo_rival_nombre,
      deporte: dto.deporte.toUpperCase(),
      fecha_propuesta: dto.fecha_propuesta,
      hora_propuesta: dto.hora_propuesta,
      cancha_nombre: dto.cancha_nombre,
      mensaje: dto.mensaje,
      estado: 'PENDIENTE',
      creado_en: new Date().toISOString(),
    };

    challengeStore[challengeId] = newChallenge;
    return newChallenge;
  }

  static async getChallenges(userId: string): Promise<ChallengeItem[]> {
    const list = Object.values(challengeStore);
    if (list.length === 0) {
      // Seed default challenge if empty
      const defaultId = 'chal_sample_1';
      challengeStore[defaultId] = {
        id: defaultId,
        equipo_retador_id: 'sample_team_1',
        equipo_retador_nombre: 'Furias FC',
        capitan_retador_id: 'sample_cap_1',
        capitan_retador_nombre: 'Carlos Valderrama',
        equipo_rival_nombre: 'Mi Equipo',
        deporte: 'FUTBOL',
        fecha_propuesta: '2026-09-12',
        hora_propuesta: '20:00',
        cancha_nombre: 'Centro Deportivo Central - Cancha 1',
        mensaje: '¡Queremos revancha del fin de semana pasado! ¿Aceptan?',
        estado: 'PENDIENTE',
        creado_en: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      };
      return [challengeStore[defaultId]];
    }

    return list.sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime());
  }

  static async respondToChallenge(
    challengeId: string,
    requesterId: string,
    dto: RespondChallengeDto
  ): Promise<ChallengeItem> {
    const challenge = challengeStore[challengeId];
    if (!challenge) throw new AppError('Desafío no encontrado', 404);

    challenge.estado = dto.respuesta;
    return challenge;
  }
}

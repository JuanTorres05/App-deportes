import { prisma } from '../../lib/prisma';
import { AppError } from '../auth/auth.service';
import { CreateTeamDto, InviteMemberDto, RespondInvitationDto } from './dto/teams.dto';

export class TeamsService {
  static async createTeam(creatorId: string, dto: CreateTeamDto) {
    const team = await prisma.$transaction(async (tx) => {
      const newTeam = await tx.equipo.create({
        data: {
          nombre: dto.nombre,
          deporte: dto.deporte ? dto.deporte.toUpperCase() : 'FUTBOL',
          foto_url: dto.foto_url ?? null,
          creado_por: creatorId,
        },
      });

      // Add creator as captain with accepted status
      await tx.equipoMiembro.create({
        data: {
          equipo_id: newTeam.id,
          usuario_id: creatorId,
          rol: 'CAPITAN',
          estado: 'ACEPTADO',
        },
      });

      return newTeam;
    });

    return team;
  }

  static async getUserTeams(userId: string) {
    const memberships = await prisma.equipoMiembro.findMany({
      where: { usuario_id: userId, estado: 'ACEPTADO' },
      include: {
        equipo: {
          include: {
            creador: { select: { id: true, nombre: true, foto_url: true } },
            miembros: {
              where: { estado: 'ACEPTADO' },
              include: {
                usuario: { select: { id: true, nombre: true, foto_url: true } },
              },
            },
          },
        },
      },
      orderBy: { invitado_en: 'desc' },
    });

    return memberships.map((m) => ({
      ...m.equipo,
      rol: m.rol,
      total_miembros: m.equipo.miembros.length,
    }));
  }

  static async getPendingInvitations(userId: string) {
    const pending = await prisma.equipoMiembro.findMany({
      where: { usuario_id: userId, estado: 'PENDIENTE' },
      include: {
        equipo: {
          include: {
            creador: { select: { id: true, nombre: true, foto_url: true } },
          },
        },
      },
    });

    return pending.map((m) => ({
      equipo_id: m.equipo_id,
      equipo_nombre: m.equipo.nombre,
      deporte: m.equipo.deporte,
      creador: m.equipo.creador,
      invitado_en: m.invitado_en,
    }));
  }

  static async getTeamById(teamId: string) {
    const team = await prisma.equipo.findUnique({
      where: { id: teamId },
      include: {
        creador: { select: { id: true, nombre: true, foto_url: true, email: true } },
        miembros: {
          include: {
            usuario: { select: { id: true, nombre: true, foto_url: true, email: true } },
          },
        },
      },
    });

    if (!team) throw new AppError('Equipo no encontrado', 404);
    return team;
  }

  static async inviteMember(teamId: string, requesterId: string, dto: InviteMemberDto) {
    const team = await prisma.equipo.findUnique({ where: { id: teamId } });
    if (!team) throw new AppError('Equipo no encontrado', 404);

    if (team.creado_por !== requesterId) {
      throw new AppError('Solo el capitán del equipo puede invitar miembros', 403);
    }

    let targetUserId = dto.usuario_id;
    if (!targetUserId && dto.email) {
      const user = await prisma.usuario.findUnique({ where: { email: dto.email.toLowerCase() } });
      if (!user) throw new AppError('No se encontró ningún usuario con ese correo electrónico', 444);
      targetUserId = user.id;
    }

    if (!targetUserId) throw new AppError('Usuario no especificado', 400);

    const existingMember = await prisma.equipoMiembro.findUnique({
      where: { equipo_id_usuario_id: { equipo_id: teamId, usuario_id: targetUserId } },
    });

    if (existingMember) {
      if (existingMember.estado === 'ACEPTADO') {
        throw new AppError('El usuario ya es miembro activo de este equipo', 400);
      }
      if (existingMember.estado === 'PENDIENTE') {
        throw new AppError('Ya se ha enviado una invitación pendiente a este usuario', 400);
      }
    }

    return prisma.equipoMiembro.upsert({
      where: { equipo_id_usuario_id: { equipo_id: teamId, usuario_id: targetUserId } },
      create: {
        equipo_id: teamId,
        usuario_id: targetUserId,
        rol: 'MIEMBRO',
        estado: 'PENDIENTE',
      },
      update: {
        estado: 'PENDIENTE',
      },
    });
  }

  static async respondInvitation(userId: string, dto: RespondInvitationDto) {
    const membership = await prisma.equipoMiembro.findUnique({
      where: { equipo_id_usuario_id: { equipo_id: dto.equipo_id, usuario_id: userId } },
    });

    if (!membership) throw new AppError('No se encontró la invitación para este equipo', 404);
    if (membership.estado !== 'PENDIENTE') {
      throw new AppError(`La invitación ya se encuentra en estado ${membership.estado}`, 400);
    }

    const newStatus = dto.aceptar ? 'ACEPTADO' : 'RECHAZADO';

    return prisma.equipoMiembro.update({
      where: { equipo_id_usuario_id: { equipo_id: dto.equipo_id, usuario_id: userId } },
      data: { estado: newStatus },
    });
  }
}

import { prisma } from '../../lib/prisma';
import { PlayerFilterDto, CourtFilterDto } from './dto/discovery.dto';

export class DiscoveryService {
  static async searchPlayers(currentUserId: string, filters: PlayerFilterDto) {
    const whereClause: any = {
      id: { not: currentUserId },
    };

    if (filters.query) {
      whereClause.OR = [
        { nombre: { contains: filters.query, mode: 'insensitive' } },
        { email: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    if (filters.deporte || filters.nivel || filters.posicion || filters.solo_activos) {
      whereClause.perfiles_deportivos = {
        some: {
          ...(filters.deporte && { deporte: { equals: filters.deporte, mode: 'insensitive' } }),
          ...(filters.nivel && { nivel: { equals: filters.nivel, mode: 'insensitive' } }),
          ...(filters.posicion && { posicion: { equals: filters.posicion, mode: 'insensitive' } }),
          ...(filters.solo_activos && { activo: true }),
        },
      };
    }

    const users = await prisma.usuario.findMany({
      where: whereClause,
      select: {
        id: true,
        nombre: true,
        foto_url: true,
        perfiles_deportivos: {
          select: {
            deporte: true,
            nivel: true,
            posicion: true,
            activo: true,
          },
        },
      },
      take: 30,
    });

    return users.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      foto_url: u.foto_url,
      perfiles: u.perfiles_deportivos,
      esta_en_linea: u.perfiles_deportivos.some((p) => p.activo),
    }));
  }

  static async searchCourts(filters: CourtFilterDto) {
    const whereClause: any = {};

    if (filters.query) {
      whereClause.OR = [
        { nombre: { contains: filters.query, mode: 'insensitive' } },
        { centro_deportivo: { nombre: { contains: filters.query, mode: 'insensitive' } } },
      ];
    }

    if (filters.deporte) {
      whereClause.tipo = { equals: filters.deporte, mode: 'insensitive' };
    }

    if (filters.precio_max) {
      whereClause.precio_hora = { lte: filters.precio_max };
    }

    const courts = await prisma.cancha.findMany({
      where: whereClause,
      include: {
        centro_deportivo: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
      take: 30,
    });

    return courts.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      deporte: c.tipo,
      precio_hora: Number(c.precio_hora),
      centro_deportivo_nombre: c.centro_deportivo.nombre,
    }));
  }
}

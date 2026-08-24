import { prisma } from '../../lib/prisma';
import { AppError } from '../auth/auth.service';
import { UpdateProfileDto, UpsertSportDto, ToggleActivationDto } from './dto/profile.dto';

export interface NearbyPlayer {
  id: string;
  nombre: string;
  foto_url: string | null;
  deporte: string;
  posicion: string | null;
  nivel: string | null;
  distancia_km: number;
}

export class ProfileService {
  static async getProfileById(userId: string) {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nombre: true,
        email: true,
        foto_url: true,
        radio_busqueda_km: true,
        creado_en: true,
        perfiles_deportivos: {
          select: {
            deporte: true,
            posicion: true,
            nivel: true,
            activo: true,
          },
        },
        fotos: {
          select: {
            id: true,
            url: true,
            tipo: true,
            orden: true,
            creado_en: true,
          },
          orderBy: { orden: 'asc' },
        },
      },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return user;
  }

  static async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await prisma.usuario.update({
      where: { id: userId },
      data: {
        ...(dto.nombre && { nombre: dto.nombre }),
        ...(dto.foto_url !== undefined && { foto_url: dto.foto_url }),
        ...(dto.radio_busqueda_km && { radio_busqueda_km: dto.radio_busqueda_km }),
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        foto_url: true,
        radio_busqueda_km: true,
      },
    });

    return user;
  }

  static async upsertSport(userId: string, dto: UpsertSportDto) {
    const sport = await prisma.perfilDeportivo.upsert({
      where: {
        usuario_id_deporte: {
          usuario_id: userId,
          deporte: dto.deporte.toUpperCase(),
        },
      },
      update: {
        posicion: dto.posicion ?? null,
        nivel: dto.nivel ?? null,
      },
      create: {
        usuario_id: userId,
        deporte: dto.deporte.toUpperCase(),
        posicion: dto.posicion ?? null,
        nivel: dto.nivel ?? null,
        activo: false,
      },
    });

    return sport;
  }

  static async removeSport(userId: string, deporte: string) {
    await prisma.perfilDeportivo.deleteMany({
      where: {
        usuario_id: userId,
        deporte: deporte.toUpperCase(),
      },
    });

    return { message: 'Perfil deportivo eliminado' };
  }

  static async addPhoto(userId: string, url: string) {
    const count = await prisma.perfilFoto.count({ where: { usuario_id: userId } });
    const photo = await prisma.perfilFoto.create({
      data: {
        usuario_id: userId,
        url,
        tipo: 'FOTO',
        orden: count,
      },
    });
    return photo;
  }

  static async removePhoto(userId: string, photoId: string) {
    const photo = await prisma.perfilFoto.findFirst({
      where: { id: photoId, usuario_id: userId },
    });

    if (!photo) {
      throw new AppError('Foto no encontrada', 404);
    }

    await prisma.perfilFoto.delete({ where: { id: photoId } });
    return { message: 'Foto eliminada correctamente' };
  }

  static async updateLocation(userId: string, latitude: number, longitude: number) {
    await prisma.$executeRaw`
      UPDATE usuarios
      SET ubicacion = ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ubicacion_actualizada_en = NOW()
      WHERE id = ${userId}::uuid
    `;

    return { message: 'Ubicación actualizada correctamente' };
  }

  static async toggleActivation(userId: string, dto: ToggleActivationDto) {
    // If coordinates are supplied upon activation, update location first
    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      await this.updateLocation(userId, dto.latitude, dto.longitude);
    }

    const sport = await prisma.perfilDeportivo.upsert({
      where: {
        usuario_id_deporte: {
          usuario_id: userId,
          deporte: dto.deporte.toUpperCase(),
        },
      },
      update: {
        activo: dto.activo,
      },
      create: {
        usuario_id: userId,
        deporte: dto.deporte.toUpperCase(),
        activo: dto.activo,
      },
    });

    return sport;
  }

  static async updateSearchRadius(userId: string, radio_busqueda_km: number) {
    const user = await prisma.usuario.update({
      where: { id: userId },
      data: { radio_busqueda_km },
      select: { id: true, radio_busqueda_km: true },
    });
    return user;
  }

  static async getNearbyPlayers(
    userId: string,
    deporte: string,
    latitude?: number,
    longitude?: number,
    radiusKmOverride?: number
  ): Promise<NearbyPlayer[]> {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { radio_busqueda_km: true },
    });

    const searchRadiusKm = radiusKmOverride || user?.radio_busqueda_km || 5;
    const radiusMeters = searchRadiusKm * 1000;

    // If explicit lat/lng supplied, use them; otherwise, use user's saved location in database
    if (latitude !== undefined && longitude !== undefined) {
      return prisma.$queryRaw<NearbyPlayer[]>`
        SELECT 
          u.id, 
          u.nombre, 
          u.foto_url, 
          pd.deporte, 
          pd.posicion, 
          pd.nivel,
          ROUND((ST_Distance(u.ubicacion, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography) / 1000.0)::numeric, 1)::float AS distancia_km
        FROM usuarios u
        JOIN perfiles_deportivos pd ON pd.usuario_id = u.id
        WHERE u.id != ${userId}::uuid
          AND UPPER(pd.deporte) = UPPER(${deporte})
          AND pd.activo = true
          AND u.ubicacion IS NOT NULL
          AND ST_DWithin(
            u.ubicacion, 
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography, 
            ${radiusMeters}
          )
        ORDER BY distancia_km ASC
      `;
    }

    // Rely on current user saved location in database
    return prisma.$queryRaw<NearbyPlayer[]>`
      SELECT 
        u.id, 
        u.nombre, 
        u.foto_url, 
        pd.deporte, 
        pd.posicion, 
        pd.nivel,
        ROUND((ST_Distance(u.ubicacion, curr.ubicacion) / 1000.0)::numeric, 1)::float AS distancia_km
      FROM usuarios u
      JOIN perfiles_deportivos pd ON pd.usuario_id = u.id
      CROSS JOIN (SELECT ubicacion FROM usuarios WHERE id = ${userId}::uuid) curr
      WHERE u.id != ${userId}::uuid
        AND UPPER(pd.deporte) = UPPER(${deporte})
        AND pd.activo = true
        AND u.ubicacion IS NOT NULL
        AND curr.ubicacion IS NOT NULL
        AND ST_DWithin(u.ubicacion, curr.ubicacion, ${radiusMeters})
      ORDER BY distancia_km ASC
    `;
  }
}

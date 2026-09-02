import { prisma } from '../../lib/prisma';
import { AppError } from '../auth/auth.service';

export class CanchasService {
  static async getNearbyCourts(
    userId: string,
    lat?: number,
    lng?: number,
    radiusKm: number = 10,
    tipo?: string
  ) {
    let latitude = lat;
    let longitude = lng;

    if (!latitude || !longitude) {
      const userRaw = await prisma.$queryRaw<Array<{ st_y: number | null; st_x: number | null }>>`
        SELECT ST_Y(ubicacion::geometry) as st_y, ST_X(ubicacion::geometry) as st_x
        FROM usuarios WHERE id = ${userId}::uuid
      `;
      if (userRaw.length > 0 && userRaw[0].st_y && userRaw[0].st_x) {
        latitude = userRaw[0].st_y;
        longitude = userRaw[0].st_x;
      } else {
        // Fallback default coordinates (Buenos Aires Obelisco for testing)
        latitude = -34.6037;
        longitude = -58.3816;
      }
    }

    const radiusMeters = radiusKm * 1000;
    const sportFilter = tipo ? tipo.toUpperCase() : null;

    const rawCourts = await prisma.$queryRaw<
      Array<{
        id: string;
        nombre: string;
        tipo: string;
        precio_hora: number;
        centro_deportivo_id: string;
        centro_nombre: string;
        latitude: number | null;
        longitude: number | null;
        distancia_km: number;
      }>
    >`
      SELECT 
        c.id,
        c.nombre,
        c.tipo,
        c.precio_hora::float as precio_hora,
        c.centro_deportivo_id,
        cd.nombre as centro_nombre,
        ST_Y(c.ubicacion::geometry) as latitude,
        ST_X(c.ubicacion::geometry) as longitude,
        ROUND((ST_Distance(
          c.ubicacion,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography
        ) / 1000.0)::numeric, 2)::float as distancia_km
      FROM canchas c
      JOIN centros_deportivos cd ON cd.id = c.centro_deportivo_id
      WHERE c.ubicacion IS NOT NULL
        AND ST_DWithin(
          c.ubicacion,
          ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
          ${radiusMeters}
        )
        ${sportFilter ? prisma.$queryRaw`AND UPPER(c.tipo) = ${sportFilter}` : prisma.$queryRaw``}
      ORDER BY distancia_km ASC
      LIMIT 30
    `;

    return rawCourts;
  }

  static async getCourtById(courtId: string) {
    const court = await prisma.cancha.findUnique({
      where: { id: courtId },
      include: {
        centro_deportivo: {
          select: { id: true, nombre: true, usuario_admin_id: true },
        },
      },
    });

    if (!court) throw new AppError('Cancha no encontrada', 404);
    return court;
  }
}

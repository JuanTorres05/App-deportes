import { prisma } from '../../lib/prisma';
import { AppError } from '../auth/auth.service';
import { CreateReservaDto } from './dto/reservas.dto';

export class ReservasService {
  static async createReserva(userId: string, dto: CreateReservaDto) {
    const court = await prisma.cancha.findUnique({ where: { id: dto.cancha_id } });
    if (!court) throw new AppError('Cancha no encontrada', 404);

    const bookingDate = new Date(dto.fecha);

    // Overlap validation logic:
    // Existing reservation overlaps if (hora_inicio < dto.hora_fin AND dto.hora_inicio < hora_fin)
    const existingBookings = await prisma.reserva.findMany({
      where: {
        cancha_id: dto.cancha_id,
        fecha: bookingDate,
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
      },
    });

    const hasConflict = existingBookings.some(
      (b) => b.hora_inicio < dto.hora_fin && dto.hora_inicio < b.hora_fin
    );

    if (hasConflict) {
      throw new AppError(
        'El horario seleccionado ya se encuentra reservado para esta cancha. Elige otro rango horario.',
        400
      );
    }

    const newReserva = await prisma.reserva.create({
      data: {
        cancha_id: dto.cancha_id,
        usuario_id: userId,
        fecha: bookingDate,
        hora_inicio: dto.hora_inicio,
        hora_fin: dto.hora_fin,
        estado: 'CONFIRMADA',
      },
      include: {
        cancha: {
          include: {
            centro_deportivo: { select: { nombre: true } },
          },
        },
      },
    });

    return newReserva;
  }

  static async getAvailability(canchaId: string, fechaStr: string) {
    const bookingDate = new Date(fechaStr);

    const bookings = await prisma.reserva.findMany({
      where: {
        cancha_id: canchaId,
        fecha: bookingDate,
        estado: { in: ['PENDIENTE', 'CONFIRMADA'] },
      },
      select: { hora_inicio: true, hora_fin: true },
    });

    return bookings;
  }

  static async getUserBookings(userId: string) {
    const bookings = await prisma.reserva.findMany({
      where: { usuario_id: userId },
      include: {
        cancha: {
          include: {
            centro_deportivo: { select: { id: true, nombre: true } },
          },
        },
      },
      orderBy: [{ fecha: 'desc' }, { hora_inicio: 'desc' }],
    });

    return bookings;
  }
}

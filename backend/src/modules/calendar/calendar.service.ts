import { prisma } from '../../lib/prisma';

interface CalendarEvent {
  id: string;
  tipo: 'PARTIDO' | 'RESERVA' | 'TORNEO';
  icono: string;
  titulo: string;
  subtitulo: string;
  fecha: Date | null;
  hora_inicio: string | null;
  hora_fin: string | null;
  ref_id: string;
  dias_restantes: number | null;
}

export class CalendarService {
  static async getCalendar(userId: string): Promise<CalendarEvent[]> {
    const now = new Date();

    const [partidos, reservas] = await Promise.all([
      // Upcoming matches where user participates as organizer or player
      prisma.partido.findMany({
        where: {
          OR: [
            { organizador_id: userId },
            { jugadores: { some: { usuario_id: userId } } },
          ],
          estado: { in: ['BUSCANDO_GENTE', 'LISTO'] },
        },
        include: {
          cancha: { select: { nombre: true } },
        },
        orderBy: { fecha: 'asc' },
        take: 15,
      }),
      // Upcoming confirmed reservations for the user
      prisma.reserva.findMany({
        where: {
          usuario_id: userId,
          estado: 'CONFIRMADA',
          fecha: { gte: now },
        },
        include: {
          cancha: { select: { nombre: true } },
        },
        orderBy: { fecha: 'asc' },
        take: 15,
      }),
    ]);

    const events: CalendarEvent[] = [];

    for (const p of partidos) {
      const fecha = p.fecha;
      const diasRestantes = fecha
        ? Math.ceil((fecha.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      events.push({
        id: `partido_${p.id}`,
        tipo: 'PARTIDO',
        icono: '⚽',
        titulo: `Partido de ${p.deporte}`,
        subtitulo: p.cancha ? `📍 ${p.cancha.nombre}` : '📍 Cancha por confirmar',
        fecha,
        hora_inicio: p.hora_inicio,
        hora_fin: p.hora_fin,
        ref_id: p.id,
        dias_restantes: diasRestantes,
      });
    }

    for (const r of reservas) {
      const fecha = r.fecha;
      const diasRestantes = Math.ceil(
        (fecha.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );

      events.push({
        id: `reserva_${r.id}`,
        tipo: 'RESERVA',
        icono: '📅',
        titulo: 'Turno reservado',
        subtitulo: `📍 ${r.cancha.nombre} · ${r.hora_inicio} – ${r.hora_fin}`,
        fecha,
        hora_inicio: r.hora_inicio,
        hora_fin: r.hora_fin,
        ref_id: r.id,
        dias_restantes: diasRestantes,
      });
    }

    // Sort all events by date ascending, nulls last
    events.sort((a, b) => {
      if (!a.fecha) return 1;
      if (!b.fecha) return -1;
      return a.fecha.getTime() - b.fecha.getTime();
    });

    return events;
  }
}

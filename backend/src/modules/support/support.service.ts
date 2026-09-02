import { prisma } from '../../lib/prisma';
import { AppError } from '../auth/auth.service';
import { CreateReportDto } from './dto/support.dto';

export interface SupportFaq {
  id: string;
  categoria: string;
  pregunta: string;
  respuesta: string;
}

export interface SupportTicket {
  id: string;
  usuario_id: string;
  tipo: string;
  asunto: string;
  descripcion: string;
  usuario_reportado_id?: string;
  estado: 'RECIBIDO' | 'EN_REVISION' | 'RESUELTO';
  creado_en: string;
}

const FAQS_CATALOG: SupportFaq[] = [
  {
    id: 'faq_1',
    categoria: 'PARTIDOS',
    pregunta: '¿Cómo funciona la búsqueda de jugadores cercanos?',
    respuesta: 'PlayConnect utiliza tu ubicación GPS en tiempo real para encontrar deportistas activos en un radio configurable (desde 2 km hasta 50 km). Puedes activarte en línea desde tu perfil.',
  },
  {
    id: 'faq_2',
    categoria: 'RESERVAS',
    pregunta: '¿Cómo se garantiza que no haya doble reserva de cancha?',
    respuesta: 'Nuestro motor de reservas valida en tiempo real que ningún turno solicitado se traslape con reservas confirmadas previas para la misma cancha y fecha.',
  },
  {
    id: 'faq_3',
    categoria: 'PAGOS',
    pregunta: '¿Cómo se divide el costo de una cancha entre los jugadores?',
    respuesta: 'En el detalle de tu partido, la herramienta de División de Costos calcula automáticamente la cuota exacta por jugador dividiendo el total entre los participantes confirmados.',
  },
  {
    id: 'faq_4',
    categoria: 'TORNEOS',
    pregunta: '¿Cómo se generan los brackets de eliminatorias?',
    respuesta: 'Una vez completado el cupo del torneo o cerradas las inscripciones, el organizador genera el cuadro que distribuye aleatoriamente a los equipos en cuartos, semifinales y final.',
  },
  {
    id: 'faq_5',
    categoria: 'PREMIUM',
    pregunta: '¿Qué beneficios ofrece la membresía PlayConnect PRO?',
    respuesta: 'Permite crear equipos ilimitados, extiende tu radio de búsqueda geográfica hasta 50 km y otorga el distintivo de usuario verificado con estadísticas avanzadas.',
  },
];

const supportTicketsStore: Record<string, SupportTicket[]> = {};

export class SupportService {
  static async getFaqs(): Promise<SupportFaq[]> {
    return FAQS_CATALOG;
  }

  static async createReport(userId: string, dto: CreateReportDto): Promise<SupportTicket> {
    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Usuario no encontrado', 404);

    const ticket: SupportTicket = {
      id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      usuario_id: userId,
      tipo: dto.tipo,
      asunto: dto.asunto,
      descripcion: dto.descripcion,
      usuario_reportado_id: dto.usuario_reportado_id,
      estado: 'RECIBIDO',
      creado_en: new Date().toISOString(),
    };

    if (!supportTicketsStore[userId]) {
      supportTicketsStore[userId] = [];
    }

    supportTicketsStore[userId].unshift(ticket);
    return ticket;
  }

  static async getMyReports(userId: string): Promise<SupportTicket[]> {
    return supportTicketsStore[userId] || [];
  }
}

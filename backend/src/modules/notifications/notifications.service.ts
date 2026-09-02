import { prisma } from '../../lib/prisma';
import { AppError } from '../auth/auth.service';

export interface NotificationItem {
  id: string;
  usuario_id: string;
  tipo: 'PARTIDO' | 'EQUIPO' | 'RESERVA' | 'TORNEO' | 'SISTEMA';
  titulo: string;
  mensaje: string;
  leido: boolean;
  creado_en: string;
}

const notificationStore: Record<string, NotificationItem[]> = {};

export class NotificationsService {
  static async getUserNotifications(userId: string): Promise<NotificationItem[]> {
    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Usuario no encontrado', 404);

    if (!notificationStore[userId] || notificationStore[userId].length === 0) {
      // Seed realistic initial notifications if empty
      notificationStore[userId] = [
        {
          id: `notif_${Date.now()}_1`,
          usuario_id: userId,
          tipo: 'EQUIPO',
          titulo: '¡Invitación a Equipo!',
          mensaje: 'Has sido invitado a formar parte del equipo Los Galácticos FC.',
          leido: false,
          creado_en: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30m ago
        },
        {
          id: `notif_${Date.now()}_2`,
          usuario_id: userId,
          tipo: 'PARTIDO',
          titulo: 'Recordatorio de Partido',
          mensaje: 'Tienes un partido programado para hoy a las 19:00 hrs.',
          leido: false,
          creado_en: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2h ago
        },
        {
          id: `notif_${Date.now()}_3`,
          usuario_id: userId,
          tipo: 'TORNEO',
          titulo: 'Nuevo Torneo Disponible',
          mensaje: 'Se han abierto las inscripciones para la Copa Apertura 2026.',
          leido: true,
          creado_en: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        },
        {
          id: `notif_${Date.now()}_4`,
          usuario_id: userId,
          tipo: 'RESERVA',
          titulo: 'Reserva Confirmada',
          mensaje: 'Tu turno en Cancha Sintética 1 ha sido confirmado exitosamente.',
          leido: true,
          creado_en: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        },
      ];
    }

    return notificationStore[userId].sort(
      (a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime()
    );
  }

  static async getUnreadCount(userId: string): Promise<number> {
    const list = await this.getUserNotifications(userId);
    return list.filter((n) => !n.leido).length;
  }

  static async markAsRead(userId: string, notificationId: string): Promise<NotificationItem> {
    const list = await this.getUserNotifications(userId);
    const item = list.find((n) => n.id === notificationId);
    if (!item) throw new AppError('Notificación no encontrada', 404);

    item.leido = true;
    return item;
  }

  static async markAllAsRead(userId: string): Promise<{ count: number }> {
    const list = await this.getUserNotifications(userId);
    let count = 0;
    list.forEach((n) => {
      if (!n.leido) {
        n.leido = true;
        count++;
      }
    });
    return { count };
  }
}

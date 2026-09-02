import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { NotificationsService } from './notifications.service';

interface AppError extends Error { statusCode?: number; }

export class NotificationsController {
  static async getNotifications(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const notifications = await NotificationsService.getUserNotifications(userId);
      res.status(200).json({ notifications });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async getUnreadCount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const unreadCount = await NotificationsService.getUnreadCount(userId);
      res.status(200).json({ unreadCount });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const notification = await NotificationsService.markAsRead(userId, req.params.id);
      res.status(200).json({ message: 'Notificación marcada como leída', notification });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const result = await NotificationsService.markAllAsRead(userId);
      res.status(200).json({ message: 'Todas las notificaciones marcadas como leídas', ...result });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }
}

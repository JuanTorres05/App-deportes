import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { ReservasService } from './reservas.service';
import { createReservaSchema, availabilityQuerySchema } from './dto/reservas.dto';

interface AppError extends Error { statusCode?: number; }

export class ReservasController {
  static async createReserva(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const dto = createReservaSchema.parse(req.body);
      const reserva = await ReservasService.createReserva(userId, dto);
      res.status(201).json({ message: 'Reserva confirmada exitosamente', reserva });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async getAvailability(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.sub) { res.status(401).json({ message: 'No autorizado' }); return; }

      const { cancha_id, fecha } = availabilityQuerySchema.parse(req.query);
      const bookings = await ReservasService.getAvailability(cancha_id, fecha);
      res.status(200).json({ occupiedSlots: bookings });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async getUserBookings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const bookings = await ReservasService.getUserBookings(userId);
      res.status(200).json({ bookings });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }
}

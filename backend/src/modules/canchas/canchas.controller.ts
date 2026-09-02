import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { CanchasService } from './canchas.service';
import { nearbyCourtsQuerySchema } from './dto/canchas.dto';

interface AppError extends Error { statusCode?: number; }

export class CanchasController {
  static async getNearby(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const { latitude, longitude, radiusKm, tipo } = nearbyCourtsQuerySchema.parse(req.query);
      const courts = await CanchasService.getNearbyCourts(userId, latitude, longitude, radiusKm, tipo);
      res.status(200).json({ courts });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.sub) { res.status(401).json({ message: 'No autorizado' }); return; }
      const court = await CanchasService.getCourtById(req.params.id);
      res.status(200).json({ court });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }
}

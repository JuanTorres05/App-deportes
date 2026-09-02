import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { DiscoveryService } from './discovery.service';
import { playerFilterSchema, courtFilterSchema } from './dto/discovery.dto';

interface AppError extends Error { statusCode?: number; }

export class DiscoveryController {
  static async searchPlayers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const filters = playerFilterSchema.parse(req.query);
      const players = await DiscoveryService.searchPlayers(userId, filters);
      res.status(200).json({ players });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async searchCourts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.sub) { res.status(401).json({ message: 'No autorizado' }); return; }

      const filters = courtFilterSchema.parse(req.query);
      const courts = await DiscoveryService.searchCourts(filters);
      res.status(200).json({ courts });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }
}

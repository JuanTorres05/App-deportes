import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { RatingsService } from './ratings.service';
import { submitRatingSchema } from './dto/ratings.dto';

interface AppError extends Error { statusCode?: number; }

export class RatingsController {
  static async submitRating(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }
      const dto = submitRatingSchema.parse(req.body);
      const rating = await RatingsService.submitRating(userId, dto);
      res.status(201).json({ message: 'Calificación enviada exitosamente', rating });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async getUserAverage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.sub) { res.status(401).json({ message: 'No autorizado' }); return; }
      const average = await RatingsService.getUserRatingAverage(req.params.userId);
      res.status(200).json({ average });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async getMatchRatings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }
      const ratings = await RatingsService.getMatchRatings(req.params.matchId, userId);
      res.status(200).json({ ratings });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }
}

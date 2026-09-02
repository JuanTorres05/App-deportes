import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { SocialService } from './social.service';

interface AppError extends Error { statusCode?: number; }

export class SocialController {
  static async getPublicProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.sub) { res.status(401).json({ message: 'No autorizado' }); return; }
      const { userId } = req.params;
      const profile = await SocialService.getPublicProfile(userId);
      res.status(200).json({ profile });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async getActivityFeed(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }
      const feed = await SocialService.getActivityFeed(userId);
      res.status(200).json({ feed });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }
}

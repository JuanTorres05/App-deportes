import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { FavoritesService } from './favorites.service';
import { addFavoriteSchema } from './dto/favorites.dto';

interface AppError extends Error { statusCode?: number; }

export class FavoritesController {
  static async getFavorites(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }
      const favorites = await FavoritesService.getFavorites(userId);
      res.status(200).json({ favorites });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async addFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }
      const dto = addFavoriteSchema.parse(req.body);
      const fav = await FavoritesService.addFavorite(userId, dto);
      res.status(201).json({ message: 'Agregado a favoritos', favorite: fav });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async removeFavorite(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }
      const { id } = req.params;
      const result = await FavoritesService.removeFavorite(userId, id);
      res.status(200).json({ message: 'Eliminado de favoritos', ...result });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }
}

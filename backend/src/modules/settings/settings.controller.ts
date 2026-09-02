import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { SettingsService } from './settings.service';
import { updatePreferencesSchema, changePasswordSchema } from './dto/settings.dto';

interface AppError extends Error { statusCode?: number; }

export class SettingsController {
  static async getSettings(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const data = await SettingsService.getUserSettings(userId);
      res.status(200).json(data);
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const dto = updatePreferencesSchema.parse(req.body);
      const preferences = await SettingsService.updatePreferences(userId, dto);
      res.status(200).json({ message: 'Preferencias guardadas exitosamente', preferences });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const dto = changePasswordSchema.parse(req.body);
      await SettingsService.changePassword(userId, dto);
      res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }
}

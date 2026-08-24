import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { ProfileService } from './profile.service';
import {
  updateProfileSchema,
  upsertSportSchema,
  toggleActivationSchema,
  updateLocationSchema,
  updateRadiusSchema,
  nearbyPlayersQuerySchema,
} from './dto/profile.dto';

interface AppError extends Error {
  statusCode?: number;
}

export class ProfileController {
  static async getMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: 'No autorizado' });
        return;
      }
      const profile = await ProfileService.getProfileById(userId);
      res.status(200).json({ profile });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) {
        res.status(err.statusCode).json({ message: err.message });
        return;
      }
      next(error);
    }
  }

  static async getProfileById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const profile = await ProfileService.getProfileById(id);
      res.status(200).json({ profile });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) {
        res.status(err.statusCode).json({ message: err.message });
        return;
      }
      next(error);
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: 'No autorizado' });
        return;
      }
      const validatedData = updateProfileSchema.parse(req.body);
      const user = await ProfileService.updateProfile(userId, validatedData);
      res.status(200).json({ message: 'Perfil actualizado exitosamente', user });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) {
        res.status(err.statusCode).json({ message: err.message });
        return;
      }
      next(error);
    }
  }

  static async upsertSport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: 'No autorizado' });
        return;
      }
      const validatedData = upsertSportSchema.parse(req.body);
      const sport = await ProfileService.upsertSport(userId, validatedData);
      res.status(200).json({ message: 'Perfil deportivo guardado', sport });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) {
        res.status(err.statusCode).json({ message: err.message });
        return;
      }
      next(error);
    }
  }

  static async removeSport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: 'No autorizado' });
        return;
      }
      const { deporte } = req.params;
      const result = await ProfileService.removeSport(userId, deporte);
      res.status(200).json(result);
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) {
        res.status(err.statusCode).json({ message: err.message });
        return;
      }
      next(error);
    }
  }

  static async uploadPhoto(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: 'No autorizado' });
        return;
      }
      if (!req.file) {
        res.status(400).json({ message: 'Debes seleccionar una imagen para subir' });
        return;
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const photo = await ProfileService.addPhoto(userId, fileUrl);
      res.status(201).json({ message: 'Foto subida exitosamente', photo });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) {
        res.status(err.statusCode).json({ message: err.message });
        return;
      }
      next(error);
    }
  }

  static async removePhoto(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: 'No autorizado' });
        return;
      }
      const { photoId } = req.params;
      const result = await ProfileService.removePhoto(userId, photoId);
      res.status(200).json(result);
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) {
        res.status(err.statusCode).json({ message: err.message });
        return;
      }
      next(error);
    }
  }

  static async toggleActivation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: 'No autorizado' });
        return;
      }
      const validatedData = toggleActivationSchema.parse(req.body);
      const sport = await ProfileService.toggleActivation(userId, validatedData);
      res.status(200).json({ message: 'Estado de activación actualizado', sport });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) {
        res.status(err.statusCode).json({ message: err.message });
        return;
      }
      next(error);
    }
  }

  static async updateLocation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: 'No autorizado' });
        return;
      }
      const { latitude, longitude } = updateLocationSchema.parse(req.body);
      const result = await ProfileService.updateLocation(userId, latitude, longitude);
      res.status(200).json(result);
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) {
        res.status(err.statusCode).json({ message: err.message });
        return;
      }
      next(error);
    }
  }

  static async updateRadius(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: 'No autorizado' });
        return;
      }
      const { radio_busqueda_km } = updateRadiusSchema.parse(req.body);
      const user = await ProfileService.updateSearchRadius(userId, radio_busqueda_km);
      res.status(200).json({ message: 'Radio de búsqueda actualizado', user });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) {
        res.status(err.statusCode).json({ message: err.message });
        return;
      }
      next(error);
    }
  }

  static async getNearbyPlayers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) {
        res.status(401).json({ message: 'No autorizado' });
        return;
      }
      const { deporte, latitude, longitude, radiusKm } = nearbyPlayersQuerySchema.parse(req.query);

      const players = await ProfileService.getNearbyPlayers(
        userId,
        deporte,
        latitude,
        longitude,
        radiusKm
      );

      res.status(200).json({ players, count: players.length });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) {
        res.status(err.statusCode).json({ message: err.message });
        return;
      }
      next(error);
    }
  }
}

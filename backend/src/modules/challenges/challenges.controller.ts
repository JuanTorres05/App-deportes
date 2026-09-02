import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { ChallengesService } from './challenges.service';
import { createChallengeSchema, respondChallengeSchema } from './dto/challenges.dto';

interface AppError extends Error { statusCode?: number; }

export class ChallengesController {
  static async createChallenge(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const dto = createChallengeSchema.parse(req.body);
      const challenge = await ChallengesService.createChallenge(userId, dto);
      res.status(201).json({ message: '¡Desafío enviado al equipo rival exitosamente!', challenge });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async getChallenges(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const challenges = await ChallengesService.getChallenges(userId);
      res.status(200).json({ challenges });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async respondChallenge(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const dto = respondChallengeSchema.parse(req.body);
      const challenge = await ChallengesService.respondToChallenge(req.params.id, userId, dto);
      res.status(200).json({
        message: dto.respuesta === 'ACEPTADO' ? '¡Desafío aceptado! Se ha pactado el partido.' : 'Desafío rechazado.',
        challenge,
      });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }
}

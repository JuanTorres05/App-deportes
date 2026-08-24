import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { MatchesService } from './matches.service';
import { createMatchSchema, addParticipantSchema, matchHistoryQuerySchema } from './dto/matches.dto';

interface AppError extends Error { statusCode?: number; }

export class MatchesController {
  static async createMatch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }
      const dto = createMatchSchema.parse(req.body);
      const match = await MatchesService.createMatch(userId, dto);
      res.status(201).json({ message: 'Partido creado exitosamente', match });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async addParticipant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }
      const dto = addParticipantSchema.parse(req.body);
      const result = await MatchesService.addParticipant(req.params.id, userId, dto);
      res.status(201).json({ message: 'Participante agregado', result });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async markAsPlayed(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }
      const match = await MatchesService.markAsPlayed(req.params.id, userId);
      res.status(200).json({ message: 'Partido marcado como jugado', match });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }
      const { page, limit } = matchHistoryQuerySchema.parse(req.query);
      const result = await MatchesService.getMatchHistory(userId, page, limit);
      res.status(200).json(result);
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.sub) { res.status(401).json({ message: 'No autorizado' }); return; }
      const match = await MatchesService.getMatchById(req.params.id);
      res.status(200).json({ match });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }
}

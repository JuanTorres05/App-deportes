import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { TournamentsService } from './tournaments.service';
import { createTournamentSchema, registerTeamSchema } from './dto/tournaments.dto';

interface AppError extends Error { statusCode?: number; }

export class TournamentsController {
  static async createTournament(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const dto = createTournamentSchema.parse(req.body);
      const tournament = await TournamentsService.createTournament(userId, dto);
      res.status(201).json({ message: 'Torneo publicado exitosamente', tournament });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async getOpen(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.sub) { res.status(401).json({ message: 'No autorizado' }); return; }

      const tournaments = await TournamentsService.getOpenTournaments();
      res.status(200).json({ tournaments });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.sub) { res.status(401).json({ message: 'No autorizado' }); return; }

      const tournament = await TournamentsService.getTournamentById(req.params.id);
      res.status(200).json({ tournament });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async registerTeam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const dto = registerTeamSchema.parse(req.body);
      const tournament = await TournamentsService.registerTeam(req.params.id, userId, dto);
      res.status(200).json({ message: '¡Equipo inscrito exitosamente en el torneo!', tournament });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  // HU-25: Generate bracket
  static async generateBracket(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const bracket = await TournamentsService.generateBracket(req.params.id, userId);
      res.status(201).json({ message: 'Cuadro de brackets generado exitosamente', bracket });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async getBracket(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.sub) { res.status(401).json({ message: 'No autorizado' }); return; }

      const bracket = await TournamentsService.getBracket(req.params.id);
      res.status(200).json({ bracket });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  // HU-26: Register match score
  static async updateScore(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const { goles_a, goles_b } = req.body as { goles_a: number; goles_b: number };
      if (goles_a === undefined || goles_b === undefined) {
        res.status(400).json({ message: 'goles_a y goles_b son requeridos' });
        return;
      }

      const result = await TournamentsService.updateMatchScore(
        req.params.id,
        req.params.matchId,
        Number(goles_a),
        Number(goles_b),
      );

      res.status(200).json({
        message: result.ganador
          ? `¡${result.ganador} avanza a la siguiente ronda!`
          : 'Resultado registrado (empate - definir por penales)',
        ...result,
      });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }
}


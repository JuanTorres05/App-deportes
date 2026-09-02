import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { TeamsService } from './teams.service';
import { createTeamSchema, inviteMemberSchema, respondInvitationSchema } from './dto/teams.dto';

interface AppError extends Error { statusCode?: number; }

export class TeamsController {
  static async createTeam(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }
      const dto = createTeamSchema.parse(req.body);
      const team = await TeamsService.createTeam(userId, dto);
      res.status(201).json({ message: 'Equipo creado exitosamente', team });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async getUserTeams(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }
      const teams = await TeamsService.getUserTeams(userId);
      const pendingInvitations = await TeamsService.getPendingInvitations(userId);
      res.status(200).json({ teams, pendingInvitations });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.sub) { res.status(401).json({ message: 'No autorizado' }); return; }
      const team = await TeamsService.getTeamById(req.params.id);
      res.status(200).json({ team });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async inviteMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }
      const dto = inviteMemberSchema.parse(req.body);
      const invitation = await TeamsService.inviteMember(req.params.id, userId, dto);
      res.status(201).json({ message: 'Invitación enviada exitosamente', invitation });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async respondInvitation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }
      const dto = respondInvitationSchema.parse(req.body);
      const result = await TeamsService.respondInvitation(userId, dto);
      res.status(200).json({ message: 'Respuesta registrada', result });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }
}

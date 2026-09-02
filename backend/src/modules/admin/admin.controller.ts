import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { AdminService } from './admin.service';
import { blockCourtSlotSchema } from './dto/admin.dto';

interface AppError extends Error { statusCode?: number; }

export class AdminController {
  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const dashboard = await AdminService.getDashboard(userId);
      res.status(200).json({ dashboard });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async blockCourtSlot(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const dto = blockCourtSlotSchema.parse(req.body);
      const block = await AdminService.blockCourtSlot(userId, dto);
      res.status(201).json({ message: 'Horario bloqueado por mantenimiento exitosamente', block });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }
}

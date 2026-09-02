import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { SupportService } from './support.service';
import { createReportSchema } from './dto/support.dto';

interface AppError extends Error { statusCode?: number; }

export class SupportController {
  static async getFaqs(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.sub) { res.status(401).json({ message: 'No autorizado' }); return; }

      const faqs = await SupportService.getFaqs();
      res.status(200).json({ faqs });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async createReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const dto = createReportSchema.parse(req.body);
      const ticket = await SupportService.createReport(userId, dto);
      res.status(201).json({ message: 'Tu reporte ha sido recibido por el equipo de soporte', ticket });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }

  static async getMyReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.sub;
      if (!userId) { res.status(401).json({ message: 'No autorizado' }); return; }

      const reports = await SupportService.getMyReports(userId);
      res.status(200).json({ reports });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) { res.status(err.statusCode).json({ message: err.message }); return; }
      next(error);
    }
  }
}

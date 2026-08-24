import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema, refreshTokenSchema } from './dto/auth.dto';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

interface AppError extends Error {
  statusCode?: number;
}

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await AuthService.register(validatedData);
      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        ...result,
      });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) {
        res.status(err.statusCode).json({ message: err.message });
        return;
      }
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await AuthService.login(validatedData);
      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        ...result,
      });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) {
        res.status(err.statusCode).json({ message: err.message });
        return;
      }
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const tokens = await AuthService.refreshToken(refreshToken);
      res.status(200).json({
        message: 'Tokens renovados exitosamente',
        tokens,
      });
    } catch (error: unknown) {
      const err = error as AppError;
      if (err.statusCode) {
        res.status(err.statusCode).json({ message: err.message });
        return;
      }
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user?.sub) {
        res.status(401).json({ message: 'No autorizado' });
        return;
      }

      const user = await AuthService.getUserById(req.user.sub);
      res.status(200).json({ user });
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

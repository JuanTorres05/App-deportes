import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { RegisterDto, LoginDto } from './dto/auth.dto';

export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  nombre: string;
  email: string;
  foto_url: string | null;
  creado_en: Date;
}

export class AuthService {
  private static generateTokens(userId: string, email: string): AuthTokens {
    const accessToken = jwt.sign(
      { sub: userId, email },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    const refreshToken = jwt.sign(
      { sub: userId, email },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
    );

    return { accessToken, refreshToken };
  }

  private static sanitizeUser(user: {
    id: string;
    nombre: string;
    email: string;
    foto_url: string | null;
    creado_en: Date;
  }): UserResponse {
    return {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      foto_url: user.foto_url,
      creado_en: user.creado_en,
    };
  }

  static async register(dto: RegisterDto): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const existingUser = await prisma.usuario.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError('El correo electrónico ya está registrado', 400);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(dto.password, salt);

    const user = await prisma.usuario.create({
      data: {
        nombre: dto.nombre,
        email: dto.email.toLowerCase(),
        password_hash,
        foto_url: dto.foto_url || null,
      },
    });

    const tokens = this.generateTokens(user.id, user.email);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  static async login(dto: LoginDto): Promise<{ user: UserResponse; tokens: AuthTokens }> {
    const user = await prisma.usuario.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user || !user.password_hash) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Credenciales inválidas', 401);
    }

    const tokens = this.generateTokens(user.id, user.email);

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  static async refreshToken(token: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; email: string };

      const user = await prisma.usuario.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new AppError('Usuario no encontrado', 401);
      }

      return this.generateTokens(user.id, user.email);
    } catch (err) {
      if (err instanceof AppError) throw err;
      throw new AppError('Refresh token inválido o expirado', 401);
    }
  }

  static async getUserById(userId: string): Promise<UserResponse> {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return this.sanitizeUser(user);
  }
}

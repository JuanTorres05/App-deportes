import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma';
import { AppError } from '../auth/auth.service';
import { UpdatePreferencesDto, ChangePasswordDto } from './dto/settings.dto';

interface UserPreferences {
  radio_busqueda_km: number;
  notif_partidos: boolean;
  notif_equipos: boolean;
  notif_torneos: boolean;
}

const userPreferencesStore: Record<string, UserPreferences> = {};

export class SettingsService {
  static async getUserSettings(userId: string): Promise<{ user: any; preferences: UserPreferences }> {
    const user = await prisma.usuario.findUnique({
      where: { id: userId },
      select: { id: true, nombre: true, email: true, radio_busqueda_km: true },
    });

    if (!user) throw new AppError('Usuario no encontrado', 404);

    const prefs = userPreferencesStore[userId] || {
      radio_busqueda_km: user.radio_busqueda_km || 5,
      notif_partidos: true,
      notif_equipos: true,
      notif_torneos: true,
    };

    return { user, preferences: prefs };
  }

  static async updatePreferences(userId: string, dto: UpdatePreferencesDto): Promise<UserPreferences> {
    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Usuario no encontrado', 404);

    if (dto.radio_busqueda_km !== undefined) {
      await prisma.usuario.update({
        where: { id: userId },
        data: { radio_busqueda_km: dto.radio_busqueda_km },
      });
    }

    const currentPrefs = userPreferencesStore[userId] || {
      radio_busqueda_km: user.radio_busqueda_km || 5,
      notif_partidos: true,
      notif_equipos: true,
      notif_torneos: true,
    };

    const updatedPrefs: UserPreferences = {
      radio_busqueda_km: dto.radio_busqueda_km ?? currentPrefs.radio_busqueda_km,
      notif_partidos: dto.notif_partidos ?? currentPrefs.notif_partidos,
      notif_equipos: dto.notif_equipos ?? currentPrefs.notif_equipos,
      notif_torneos: dto.notif_torneos ?? currentPrefs.notif_torneos,
    };

    userPreferencesStore[userId] = updatedPrefs;
    return updatedPrefs;
  }

  static async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('Usuario no encontrado', 404);

    if (user.password_hash) {
      const isMatch = await bcrypt.compare(dto.current_password, user.password_hash);
      if (!isMatch) throw new AppError('La contraseña actual es incorrecta', 400);
    }

    const newHash = await bcrypt.hash(dto.new_password, 10);
    await prisma.usuario.update({
      where: { id: userId },
      data: { password_hash: newHash },
    });
  }
}

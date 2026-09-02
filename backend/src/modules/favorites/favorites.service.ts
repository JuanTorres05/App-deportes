import { AddFavoriteDto } from './dto/favorites.dto';
import { AppError } from '../auth/auth.service';

interface FavoriteItem {
  id: string;
  user_id: string;
  tipo: 'CANCHA' | 'JUGADOR' | 'TORNEO';
  ref_id: string;
  nombre: string;
  descripcion?: string;
  creado_en: Date;
}

// In-memory store (scalable to a Prisma table in production)
const favoritesStore: FavoriteItem[] = [];

export class FavoritesService {
  static async getFavorites(userId: string) {
    return favoritesStore.filter((f) => f.user_id === userId);
  }

  static async addFavorite(userId: string, dto: AddFavoriteDto) {
    const existing = favoritesStore.find(
      (f) => f.user_id === userId && f.tipo === dto.tipo && f.ref_id === dto.ref_id,
    );
    if (existing) throw new AppError('Este elemento ya está en tus favoritos', 409);

    const newFav: FavoriteItem = {
      id: `fav_${Date.now()}`,
      user_id: userId,
      tipo: dto.tipo,
      ref_id: dto.ref_id,
      nombre: dto.nombre,
      descripcion: dto.descripcion,
      creado_en: new Date(),
    };

    favoritesStore.push(newFav);
    return newFav;
  }

  static async removeFavorite(userId: string, favoriteId: string) {
    const idx = favoritesStore.findIndex(
      (f) => f.id === favoriteId && f.user_id === userId,
    );
    if (idx === -1) throw new AppError('Favorito no encontrado', 404);
    favoritesStore.splice(idx, 1);
    return { deleted: true };
  }
}

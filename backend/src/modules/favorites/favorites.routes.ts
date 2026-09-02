import { Router } from 'express';
import { FavoritesController } from './favorites.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

// GET    /api/v1/favorites       - List user favorites (HU-43)
// POST   /api/v1/favorites       - Add favorite
// DELETE /api/v1/favorites/:id   - Remove favorite
router.get('/', FavoritesController.getFavorites);
router.post('/', FavoritesController.addFavorite);
router.delete('/:id', FavoritesController.removeFavorite);

export default router;

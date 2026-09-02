import { Router } from 'express';
import { CanchasController } from './canchas.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

// GET /api/v1/canchas/nearby   - Search nearby courts with PostGIS spatial query
// GET /api/v1/canchas/:id      - Get details of a specific court/sports center

router.get('/nearby', CanchasController.getNearby);
router.get('/:id', CanchasController.getById);

export default router;

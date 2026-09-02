import { Router } from 'express';
import { DiscoveryController } from './discovery.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

// GET /api/v1/discovery/players - Multi-filter search for players (HU-39)
// GET /api/v1/discovery/courts  - Multi-filter search for courts (HU-40)

router.get('/players', DiscoveryController.searchPlayers);
router.get('/courts', DiscoveryController.searchCourts);

export default router;

import { Router } from 'express';
import { StatsController } from './stats.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

// GET /api/v1/stats/me          - My personal performance stats (HU-27)
// GET /api/v1/stats/leaderboard - Top 10 rated players ranking (HU-28)

router.get('/me', StatsController.getMyStats);
router.get('/leaderboard', StatsController.getLeaderboard);

export default router;

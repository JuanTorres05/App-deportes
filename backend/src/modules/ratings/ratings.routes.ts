import { Router } from 'express';
import { RatingsController } from './ratings.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

// POST /api/v1/ratings                      - Submit 3-criteria rating
// GET  /api/v1/ratings/user/:userId/average - Get average ratings for a user
// GET  /api/v1/ratings/match/:matchId       - Get ratings submitted by current user for a match

router.post('/', RatingsController.submitRating);
router.get('/user/:userId/average', RatingsController.getUserAverage);
router.get('/match/:matchId', RatingsController.getMatchRatings);

export default router;

import { Router } from 'express';
import { SocialController } from './social.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

// GET /api/v1/social/profile/:userId  - Public player profile (HU-41)
// GET /api/v1/social/feed             - Activity feed (HU-42)
router.get('/profile/:userId', SocialController.getPublicProfile);
router.get('/feed', SocialController.getActivityFeed);

export default router;

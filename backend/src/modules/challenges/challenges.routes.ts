import { Router } from 'express';
import { ChallengesController } from './challenges.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

// POST /api/v1/challenges             - Send a new challenge to rival team (HU-35)
// GET  /api/v1/challenges             - List all received and sent challenges (HU-36)
// PUT  /api/v1/challenges/:id/respond - Accept or reject a team challenge (HU-36)

router.post('/', ChallengesController.createChallenge);
router.get('/', ChallengesController.getChallenges);
router.put('/:id/respond', ChallengesController.respondChallenge);

export default router;

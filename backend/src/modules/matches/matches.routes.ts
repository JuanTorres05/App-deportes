import { Router } from 'express';
import { MatchesController } from './matches.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

// POST   /api/v1/matches                       - Create a match
// GET    /api/v1/matches/history               - Paginated match history
// GET    /api/v1/matches/:id                   - Get match details
// POST   /api/v1/matches/:id/participants      - Add participant
// PUT    /api/v1/matches/:id/mark-played       - Mark as JUGADO

router.post('/', MatchesController.createMatch);
router.get('/history', MatchesController.getHistory);
router.get('/:id', MatchesController.getById);
router.post('/:id/participants', MatchesController.addParticipant);
router.put('/:id/mark-played', MatchesController.markAsPlayed);
router.get('/:id/cost-split', MatchesController.getCostSplit);
router.put('/:id/payment', MatchesController.updatePayment);
router.get('/:id/messages', MatchesController.getMessages);
router.post('/:id/messages', MatchesController.sendMessage);

export default router;

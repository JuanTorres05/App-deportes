import { Router } from 'express';
import { TournamentsController } from './tournaments.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

// POST /api/v1/tournaments                             - Publish a tournament
// GET  /api/v1/tournaments                             - Get open tournaments
// GET  /api/v1/tournaments/:id                         - Get tournament details
// POST /api/v1/tournaments/:id/register-team           - Register a team for the tournament
// POST /api/v1/tournaments/:id/generate-bracket        - Generate elimination bracket (HU-25)
// GET  /api/v1/tournaments/:id/bracket                 - Get tournament bracket
// PUT  /api/v1/tournaments/:id/matches/:matchId/score  - Update match score (HU-26)

router.post('/', TournamentsController.createTournament);
router.get('/', TournamentsController.getOpen);
router.get('/:id', TournamentsController.getById);
router.post('/:id/register-team', TournamentsController.registerTeam);
router.post('/:id/generate-bracket', TournamentsController.generateBracket);
router.get('/:id/bracket', TournamentsController.getBracket);
router.put('/:id/matches/:matchId/score', TournamentsController.updateScore);

export default router;

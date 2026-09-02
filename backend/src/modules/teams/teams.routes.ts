import { Router } from 'express';
import { TeamsController } from './teams.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

// POST /api/v1/teams                   - Create a team
// GET  /api/v1/teams                   - List user teams and pending invitations
// GET  /api/v1/teams/:id               - Get team details
// POST /api/v1/teams/:id/members       - Invite member to team
// PUT  /api/v1/teams/respond           - Accept/decline invitation

router.post('/', TeamsController.createTeam);
router.get('/', TeamsController.getUserTeams);
router.put('/respond', TeamsController.respondInvitation);
router.get('/:id', TeamsController.getById);
router.post('/:id/members', TeamsController.inviteMember);

export default router;

import { Router } from 'express';
import { SubscriptionController } from './subscription.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

// GET  /api/v1/subscription/status  - Get current subscription plan status
// POST /api/v1/subscription/upgrade - Upgrade user to PlayConnect PRO

router.get('/status', SubscriptionController.getStatus);
router.post('/upgrade', SubscriptionController.upgrade);

export default router;

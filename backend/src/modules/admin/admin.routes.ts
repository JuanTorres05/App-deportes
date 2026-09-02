import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

// GET  /api/v1/admin/center/dashboard  - Get financial and operational metrics (HU-37)
// POST /api/v1/admin/center/block-slot - Block court slot for maintenance (HU-38)

router.get('/dashboard', AdminController.getDashboard);
router.post('/block-slot', AdminController.blockCourtSlot);

export default router;

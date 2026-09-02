import { Router } from 'express';
import { SupportController } from './support.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

// GET  /api/v1/support/faqs       - Get FAQs catalog (HU-33)
// POST /api/v1/support/reports    - Submit support or community report ticket (HU-34)
// GET  /api/v1/support/my-reports - View user submitted reports

router.get('/faqs', SupportController.getFaqs);
router.post('/reports', SupportController.createReport);
router.get('/my-reports', SupportController.getMyReports);

export default router;

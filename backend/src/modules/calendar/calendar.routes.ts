import { Router } from 'express';
import { CalendarController } from './calendar.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

// GET /api/v1/calendar - Upcoming personal events (HU-44)
router.get('/', CalendarController.getCalendar);

export default router;

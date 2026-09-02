import { Router } from 'express';
import { ReservasController } from './reservas.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

// POST /api/v1/reservas              - Create a reservation for a court
// GET  /api/v1/reservas/availability - Get occupied time slots for a court on a date
// GET  /api/v1/reservas/my-bookings  - Get user's reservations

router.post('/', ReservasController.createReserva);
router.get('/availability', ReservasController.getAvailability);
router.get('/my-bookings', ReservasController.getUserBookings);

export default router;

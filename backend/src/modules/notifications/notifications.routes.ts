import { Router } from 'express';
import { NotificationsController } from './notifications.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

// GET /api/v1/notifications              - Get user notifications (HU-29)
// GET /api/v1/notifications/unread-count - Get total unread count (HU-30)
// PUT /api/v1/notifications/:id/read     - Mark notification as read
// PUT /api/v1/notifications/read-all     - Mark all notifications as read

router.get('/', NotificationsController.getNotifications);
router.get('/unread-count', NotificationsController.getUnreadCount);
router.put('/read-all', NotificationsController.markAllAsRead);
router.put('/:id/read', NotificationsController.markAsRead);

export default router;

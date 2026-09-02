import { Router } from 'express';
import { SettingsController } from './settings.controller';
import { authenticateToken } from '../../middleware/auth.middleware';

const router = Router();
router.use(authenticateToken);

// GET /api/v1/settings                 - Get user preferences & settings (HU-31)
// PUT /api/v1/settings/preferences     - Update GPS radius & notification preferences (HU-31)
// PUT /api/v1/settings/change-password - Change account password securely (HU-32)

router.get('/', SettingsController.getSettings);
router.put('/preferences', SettingsController.updatePreferences);
router.put('/change-password', SettingsController.changePassword);

export default router;

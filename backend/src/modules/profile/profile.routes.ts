import { Router } from 'express';
import { ProfileController } from './profile.controller';
import { authenticateToken } from '../../middleware/auth.middleware';
import { uploadMiddleware } from '../../middleware/upload.middleware';

const router = Router();

// Protect all profile endpoints with JWT middleware
router.use(authenticateToken);

router.get('/me', ProfileController.getMyProfile);
router.put('/me', ProfileController.updateProfile);
router.get('/nearby', ProfileController.getNearbyPlayers);
router.put('/sports', ProfileController.upsertSport);
router.delete('/sports/:deporte', ProfileController.removeSport);
router.post('/photos', uploadMiddleware.single('foto'), ProfileController.uploadPhoto);
router.delete('/photos/:photoId', ProfileController.removePhoto);
router.put('/activation', ProfileController.toggleActivation);
router.put('/location', ProfileController.updateLocation);
router.put('/radius', ProfileController.updateRadius);
router.get('/:id', ProfileController.getProfileById);

export default router;

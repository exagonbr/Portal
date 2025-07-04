import { Router } from 'express';
import SettingsController from '../controllers/SettingsController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.use(requireAuth);

router.get('/', SettingsController.getAllSettings);
router.get('/:key', SettingsController.getSetting);
router.put('/:key', SettingsController.setSetting);

export default router;
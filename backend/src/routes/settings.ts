import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import SettingsController from '../controllers/SettingsController';

const router = Router();

router.use(requireAuth);

router.get('/', SettingsController.getAllSettings);
router.put('/', SettingsController.updateSettings); // Rota do service
router.get('/:key', SettingsController.getSetting);
router.put('/:key', SettingsController.setSetting);

export default router;
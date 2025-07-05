import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import LanguageController from '../controllers/LanguageController';

const router = Router();

router.use(requireAuth);

router.get('/', LanguageController.getAll);
router.post('/', LanguageController.create);
router.get('/:id', LanguageController.getById);
router.put('/:id', LanguageController.update);
router.delete('/:id', LanguageController.delete);
router.patch('/:id/status', LanguageController.toggleStatus);

export default router;
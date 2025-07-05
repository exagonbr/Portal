import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import MediaEntryController from '../controllers/MediaEntryController';

const router = Router();

router.use(requireAuth);

router.get('/', MediaEntryController.getAll);
router.post('/', MediaEntryController.create);
router.get('/:id', MediaEntryController.getById);
router.put('/:id', MediaEntryController.update);
router.delete('/:id', MediaEntryController.delete);
router.patch('/:id/status', MediaEntryController.toggleStatus);

export default router;
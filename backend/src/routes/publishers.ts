import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import PublisherController from '../controllers/PublisherController';

const router = Router();

router.use(requireAuth);

router.get('/', PublisherController.getAll);
router.post('/', PublisherController.create);
router.get('/:id', PublisherController.getById);
router.put('/:id', PublisherController.update);
router.delete('/:id', PublisherController.delete);
router.patch('/:id/status', PublisherController.toggleStatus);

export default router;
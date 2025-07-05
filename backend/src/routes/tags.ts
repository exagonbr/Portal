import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import TagController from '../controllers/TagController';

const router = Router();

router.use(requireAuth);

router.get('/', TagController.getAll);
router.post('/', TagController.create);
router.get('/:id', TagController.getById);
router.put('/:id', TagController.update);
router.delete('/:id', TagController.delete);

export default router;
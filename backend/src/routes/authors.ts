import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import AuthorController from '../controllers/AuthorController';

const router = Router();

router.use(requireAuth);

router.get('/', AuthorController.getAll);
router.post('/', AuthorController.create);
router.get('/:id', AuthorController.getById);
router.put('/:id', AuthorController.update);
router.delete('/:id', AuthorController.delete);
router.patch('/:id/status', AuthorController.toggleStatus);

export default router;
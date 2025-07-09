import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import authorController from '../controllers/AuthorController';

const router = Router();

router.use(requireAuth);

router.get('/', authorController.getAll.bind(authorController));
router.post('/', authorController.create.bind(authorController));
router.get('/:id', authorController.getById.bind(authorController));
router.put('/:id', authorController.update.bind(authorController));
router.delete('/:id', authorController.delete.bind(authorController));
router.patch('/:id/toggle-status', authorController.toggleStatus.bind(authorController));

export default router;
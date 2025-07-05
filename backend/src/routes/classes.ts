import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import ClassController from '../controllers/ClassController';

const router = Router();

router.use(requireAuth);

router.get('/', ClassController.getAll);
router.post('/', ClassController.create);
router.get('/:id', ClassController.getById);
router.put('/:id', ClassController.update);
router.delete('/:id', ClassController.delete);
router.patch('/:id/status', ClassController.toggleStatus);

export default router;
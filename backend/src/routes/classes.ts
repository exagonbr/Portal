import { Router } from 'express';
import ClassController from '../controllers/ClassController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.use(requireAuth);

router.get('/', ClassController.getAll);
router.get('/:id', ClassController.getById);
router.post('/', ClassController.create);
router.put('/:id', ClassController.update);
router.delete('/:id', ClassController.delete);

export default router;
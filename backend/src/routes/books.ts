import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import BookController from '../controllers/BookController';

const router = Router();

router.use(requireAuth);

router.get('/', BookController.getAll);
router.post('/', BookController.create);
router.get('/:id', BookController.getById);
router.put('/:id', BookController.update);
router.delete('/:id', BookController.delete);

export default router;
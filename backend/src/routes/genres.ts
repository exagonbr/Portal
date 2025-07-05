import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import GenreController from '../controllers/GenreController';

const router = Router();

router.use(requireAuth);

router.get('/', GenreController.getAll);
router.post('/', GenreController.create);
router.get('/:id', GenreController.getById);
router.put('/:id', GenreController.update);
router.delete('/:id', GenreController.delete);

export default router;
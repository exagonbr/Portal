import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import VideoController from '../controllers/VideoController';

const router = Router();

router.use(requireAuth);

router.get('/', VideoController.getAll);
router.post('/', VideoController.create);
router.get('/:id', VideoController.getById);
router.put('/:id', VideoController.update);
router.delete('/:id', VideoController.delete);

export default router;
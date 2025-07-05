import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import VideoCollectionController from '../controllers/VideoCollectionController';

const router = Router();

router.use(requireAuth);

router.get('/', VideoCollectionController.getAll);
router.post('/', VideoCollectionController.create);
router.get('/:id', VideoCollectionController.getById);
router.put('/:id', VideoCollectionController.update);
router.delete('/:id', VideoCollectionController.delete);

export default router;
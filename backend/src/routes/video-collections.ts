import { Router } from 'express';
import VideoCollectionController from '../controllers/VideoCollectionController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.use(requireAuth);

router.get('/', VideoCollectionController.getAll);
router.get('/:id', VideoCollectionController.getById);
router.post('/', VideoCollectionController.create);
router.put('/:id', VideoCollectionController.update);
router.delete('/:id', VideoCollectionController.delete);

export default router;
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import CollectionController from '../controllers/CollectionController';

const router = Router();

router.use(requireAuth);

router.get('/', CollectionController.getAll);
router.get('/search', CollectionController.search);
router.get('/popular', CollectionController.getPopular);
router.get('/top-rated', CollectionController.getTopRated);
router.get('/recent', CollectionController.getRecent);
router.post('/', CollectionController.create);
router.get('/:id', CollectionController.getById);
router.put('/:id', CollectionController.update);
router.delete('/:id', CollectionController.delete);

export default router;
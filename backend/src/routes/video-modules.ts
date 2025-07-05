import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import VideoModuleController from '../controllers/VideoModuleController';

const router = Router();

router.use(requireAuth);

router.get('/', VideoModuleController.getAll);
router.post('/', VideoModuleController.create);
router.get('/:id', VideoModuleController.getById);
router.put('/:id', VideoModuleController.update);
router.delete('/:id', VideoModuleController.delete);

export default router;
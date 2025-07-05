import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import ModuleController from '../controllers/ModuleController';

const router = Router();

router.use(requireAuth);

router.get('/', ModuleController.getAll);
router.post('/', ModuleController.create);
router.get('/:id', ModuleController.getById);
router.put('/:id', ModuleController.update);
router.delete('/:id', ModuleController.delete);

export default router;
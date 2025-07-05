import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import UnitController from '../controllers/UnitController';

const router = Router();

router.use(requireAuth);

router.get('/', UnitController.getAll);
router.post('/', UnitController.create);
router.get('/:id', UnitController.getById);
router.put('/:id', UnitController.update);
router.delete('/:id', UnitController.delete);

export default router;
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import EducationCycleController from '../controllers/EducationCycleController';

const router = Router();

router.use(requireAuth);

router.get('/', EducationCycleController.getAll);
router.post('/', EducationCycleController.create);
router.get('/:id', EducationCycleController.getById);
router.put('/:id', EducationCycleController.update);
router.delete('/:id', EducationCycleController.delete);

export default router;
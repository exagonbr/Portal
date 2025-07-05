import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import EducationalStageController from '../controllers/EducationalStageController';

const router = Router();

router.use(requireAuth);

router.get('/', EducationalStageController.getAll);
router.post('/', EducationalStageController.create);
router.get('/:id', EducationalStageController.getById);
router.put('/:id', EducationalStageController.update);
router.delete('/:id', EducationalStageController.delete);

export default router;
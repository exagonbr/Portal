import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import EducationPeriodController from '../controllers/EducationPeriodController';

const router = Router();

router.use(requireAuth);

router.get('/', EducationPeriodController.getAll);
router.post('/', EducationPeriodController.create);
router.get('/:id', EducationPeriodController.getById);
router.put('/:id', EducationPeriodController.update);
router.delete('/:id', EducationPeriodController.delete);
router.patch('/:id/status', EducationPeriodController.toggleStatus);

export default router;
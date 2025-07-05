import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import InstitutionController from '../controllers/InstitutionController';

const router = Router();

router.use(requireAuth);

router.get('/', InstitutionController.getAll);
router.post('/', InstitutionController.create);
router.get('/:id', InstitutionController.getById);
router.put('/:id', InstitutionController.update);
router.delete('/:id', InstitutionController.delete);
router.get('/:id/stats', InstitutionController.getStats);
router.get('/:id/users', InstitutionController.getUsers);
router.get('/:id/classes', InstitutionController.getClasses);
router.get('/:id/schedules', InstitutionController.getSchedules);
router.get('/:id/analytics', InstitutionController.getAnalytics);

export default router;
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import institutionController from '../controllers/InstitutionController';

const router = Router();

router.use(requireAuth);

router.get('/', institutionController.getAll.bind(institutionController));
router.post('/', institutionController.create.bind(institutionController));
router.get('/:id', institutionController.getById.bind(institutionController));
router.put('/:id', institutionController.update.bind(institutionController));
router.delete('/:id', institutionController.delete.bind(institutionController));
router.get('/:id/stats', institutionController.getStats.bind(institutionController));
router.get('/:id/users', institutionController.getUsers.bind(institutionController));
router.get('/:id/classes', institutionController.getClasses.bind(institutionController));
router.get('/:id/schedules', institutionController.getSchedules.bind(institutionController));
router.get('/:id/analytics', institutionController.getAnalytics.bind(institutionController));

export default router;
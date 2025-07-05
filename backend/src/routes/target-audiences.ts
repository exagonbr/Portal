import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import TargetAudienceController from '../controllers/TargetAudienceController';

const router = Router();

router.use(requireAuth);

router.get('/', TargetAudienceController.getAll);
router.post('/', TargetAudienceController.create);
router.get('/:id', TargetAudienceController.getById);
router.put('/:id', TargetAudienceController.update);
router.delete('/:id', TargetAudienceController.delete);
router.patch('/:id/status', TargetAudienceController.toggleStatus);

export default router;
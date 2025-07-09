import { Router } from 'express';
import targetAudienceController from '../controllers/TargetAudienceController';

const router = Router();

router.get('/', targetAudienceController.getAll.bind(targetAudienceController));
router.get('/search', targetAudienceController.search.bind(targetAudienceController));
router.get('/active', targetAudienceController.getActive.bind(targetAudienceController));
router.get('/:id', targetAudienceController.getById.bind(targetAudienceController));
router.post('/', targetAudienceController.create.bind(targetAudienceController));
router.put('/:id', targetAudienceController.update.bind(targetAudienceController));
router.put('/:id/toggle-status', targetAudienceController.toggleStatus.bind(targetAudienceController));
router.delete('/:id', targetAudienceController.delete.bind(targetAudienceController));

export default router;
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';
import AnnouncementController from '../controllers/AnnouncementController';

const router = Router();

router.use(requireAuth);

router.get('/', AnnouncementController.getAll);
router.post('/', AnnouncementController.create);
router.get('/:id', AnnouncementController.getById);
router.put('/:id', AnnouncementController.update);
router.delete('/:id', AnnouncementController.delete);
router.patch('/:id/status', AnnouncementController.toggleStatus);

export default router;
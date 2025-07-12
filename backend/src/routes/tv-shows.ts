import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import tvShowController from '../controllers/TvShowController';

const router = Router();

router.use(requireAuth);

router.get('/', tvShowController.getAll.bind(tvShowController));
router.post('/', tvShowController.create.bind(tvShowController));
router.get('/:id', tvShowController.getById.bind(tvShowController));
router.put('/:id', tvShowController.update.bind(tvShowController));
router.delete('/:id', tvShowController.delete.bind(tvShowController));
router.get('/:id/modules', tvShowController.getModules.bind(tvShowController));
router.get('/:id/videos', tvShowController.getVideos.bind(tvShowController));
router.get('/:id/stats', tvShowController.getStats.bind(tvShowController));
router.patch('/:id/toggle-status', tvShowController.toggleStatus.bind(tvShowController));

export default router;
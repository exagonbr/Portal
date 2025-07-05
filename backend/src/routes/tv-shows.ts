import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import TvShowController from '../controllers/TvShowController';

const router = Router();

router.use(requireAuth);

router.get('/', TvShowController.getAll);
router.post('/', TvShowController.create);
router.get('/:id', TvShowController.getById);
router.put('/:id', TvShowController.update);
router.delete('/:id', TvShowController.delete);
router.patch('/:id/status', TvShowController.toggleStatus);

// Novas rotas para módulos, vídeos e estatísticas
router.get('/:id/modules', TvShowController.getModules);
router.get('/:id/videos', TvShowController.getVideos);
router.get('/:id/stats', TvShowController.getStats);

export default router;
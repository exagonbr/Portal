import { Router } from 'express';
import VideoController from '../controllers/VideoController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const videoController = new VideoController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', videoController.getAll.bind(videoController));
router.get('/:id', videoController.getById.bind(videoController));
router.post('/', videoController.create.bind(videoController));
router.put('/:id', videoController.update.bind(videoController));
router.delete('/:id', videoController.delete.bind(videoController));

export default router;

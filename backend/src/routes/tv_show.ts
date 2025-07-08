import { Router } from 'express';
import { TvShowController } from '../controllers/TvShowController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const tv_showController = new TvShowController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', tv_showController.findAll.bind(tv_showController));
router.get('/:id', tv_showController.findById.bind(tv_showController));
router.post('/', tv_showController.create.bind(tv_showController));
router.put('/:id', tv_showController.update.bind(tv_showController));
router.delete('/:id', tv_showController.delete.bind(tv_showController));

export default router;

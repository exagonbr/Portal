import { Router } from 'express';
import { ViewingStatusController } from '../controllers/ViewingStatusController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const viewing_statusController = new ViewingStatusController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', viewing_statusController.findAll.bind(viewing_statusController));
router.get('/:id', viewing_statusController.findById.bind(viewing_statusController));
router.post('/', viewing_statusController.create.bind(viewing_statusController));
router.put('/:id', viewing_statusController.update.bind(viewing_statusController));
router.delete('/:id', viewing_statusController.delete.bind(viewing_statusController));

export default router;

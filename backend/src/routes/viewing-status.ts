import { Router } from 'express';
import { ViewingStatusController } from '../controllers/ViewingStatusController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const viewingStatusController = new ViewingStatusController();

// Middleware de autenticação para todas as rotas
router.use(requireAuth);

// Rotas para status de visualização
router.post('/update', viewingStatusController.updateStatus.bind(viewingStatusController));
router.post('/start', viewingStatusController.startSession.bind(viewingStatusController));
router.get('/status/:videoId', viewingStatusController.getStatus.bind(viewingStatusController));
router.get('/history', viewingStatusController.getHistory.bind(viewingStatusController));
router.get('/stats', viewingStatusController.getStats.bind(viewingStatusController));
router.delete('/status/:videoId', viewingStatusController.removeStatus.bind(viewingStatusController));

// Rotas CRUD padrão
router.get('/', viewingStatusController.getAll.bind(viewingStatusController));
router.get('/:id', viewingStatusController.getById.bind(viewingStatusController));
router.post('/', viewingStatusController.create.bind(viewingStatusController));
router.put('/:id', viewingStatusController.update.bind(viewingStatusController));
router.delete('/:id', viewingStatusController.delete.bind(viewingStatusController));

export default router;
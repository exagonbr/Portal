import { Router } from 'express';
import { ViewingStatusController } from '../controllers/ViewingStatusController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const controller = new ViewingStatusController();

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Rotas para status de visualização
router.post('/update', controller.updateStatus.bind(controller));
router.post('/interaction', controller.recordInteraction.bind(controller));
router.post('/start', controller.startSession.bind(controller));
router.get('/status/:videoId', controller.getStatus.bind(controller));
router.get('/history', controller.getHistory.bind(controller));
router.get('/stats', controller.getStats.bind(controller));
router.delete('/status/:videoId', controller.removeStatus.bind(controller));

export default router; 
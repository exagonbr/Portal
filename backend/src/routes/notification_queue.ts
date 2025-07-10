import { Router } from 'express';
import NotificationQueueController from '../controllers/NotificationQueueController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const notification_queueController = new NotificationQueueController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', notification_queueController.findAll.bind(notification_queueController));
router.get('/:id', notification_queueController.findById.bind(notification_queueController));
router.post('/', notification_queueController.create.bind(notification_queueController));
router.put('/:id', notification_queueController.update.bind(notification_queueController));
router.delete('/:id', notification_queueController.delete.bind(notification_queueController));

export default router;

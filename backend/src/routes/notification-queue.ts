import { Router } from 'express';
import { NotificationQueueController } from '../controllers/NotificationQueueController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateNotificationQueueDto, UpdateNotificationQueueDto } from '../dtos/NotificationQueueDto';

const router = Router();
const NotificationQueueController = new NotificationQueueController();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', NotificationQueueController.findAll.bind(NotificationQueueController));
router.get('/search', NotificationQueueController.search.bind(NotificationQueueController));
router.get('/:id', NotificationQueueController.findOne.bind(NotificationQueueController));
router.post('/', NotificationQueueController.create.bind(NotificationQueueController));
router.put('/:id', NotificationQueueController.update.bind(NotificationQueueController));
router.delete('/:id', NotificationQueueController.remove.bind(NotificationQueueController));

export default router;
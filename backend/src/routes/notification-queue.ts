import { Router } from 'express';
import notificationQueueController from '../controllers/NotificationQueueController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateNotificationQueueDto, UpdateNotificationQueueDto } from '../dtos/NotificationQueueDto';

const router = Router();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', notificationQueueController.getAll.bind(notificationQueueController));
router.get('/:id', notificationQueueController.getById.bind(notificationQueueController));
router.post('/', notificationQueueController.create.bind(notificationQueueController));
router.put('/:id', notificationQueueController.update.bind(notificationQueueController));
router.delete('/:id', notificationQueueController.delete.bind(notificationQueueController));

export default router;
import { Router } from 'express';
import { ActivitySessionsController } from '../controllers/ActivitySessionsController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateActivitySessionsDto, UpdateActivitySessionsDto } from '../dtos/ActivitySessionsDto';

const router = Router();
const activitySessionsController = new ActivitySessionsController();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', activitySessionsController.findAll.bind(activitySessionsController));
router.get('/search', activitySessionsController.search.bind(activitySessionsController));
router.get('/:id', activitySessionsController.findOne.bind(activitySessionsController));
router.post('/', activitySessionsController.create.bind(activitySessionsController));
router.put('/:id', activitySessionsController.update.bind(activitySessionsController));
router.delete('/:id', activitySessionsController.remove.bind(activitySessionsController));

export default router;
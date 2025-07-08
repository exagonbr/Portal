import { Router } from 'express';
import { ActivitySummariesController } from '../controllers/ActivitySummariesController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateActivitySummariesDto, UpdateActivitySummariesDto } from '../dtos/ActivitySummariesDto';

const router = Router();
const ActivitySummariesController = new ActivitySummariesController();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', ActivitySummariesController.findAll.bind(ActivitySummariesController));
router.get('/search', ActivitySummariesController.search.bind(ActivitySummariesController));
router.get('/:id', ActivitySummariesController.findOne.bind(ActivitySummariesController));
router.post('/', ActivitySummariesController.create.bind(ActivitySummariesController));
router.put('/:id', ActivitySummariesController.update.bind(ActivitySummariesController));
router.delete('/:id', ActivitySummariesController.remove.bind(ActivitySummariesController));

export default router;
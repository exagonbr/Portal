import { Router } from 'express';
import ActivitySummariesController from '../controllers/ActivitySummariesController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const activity_summariesController = new ActivitySummariesController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', activity_summariesController.findAll.bind(activity_summariesController));
router.get('/:id', activity_summariesController.findById.bind(activity_summariesController));
router.post('/', activity_summariesController.create.bind(activity_summariesController));
router.put('/:id', activity_summariesController.update.bind(activity_summariesController));
router.delete('/:id', activity_summariesController.delete.bind(activity_summariesController));

export default router;

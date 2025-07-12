import { Router } from 'express';
import ActivitySessionsController from '../controllers/ActivitySessionsController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const activity_sessionsController = new ActivitySessionsController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', activity_sessionsController.findAll.bind(activity_sessionsController));
router.get('/:id', activity_sessionsController.findById.bind(activity_sessionsController));
router.post('/', activity_sessionsController.create.bind(activity_sessionsController));
router.put('/:id', activity_sessionsController.update.bind(activity_sessionsController));
router.delete('/:id', activity_sessionsController.delete.bind(activity_sessionsController));

export default router;

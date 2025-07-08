import { Router } from 'express';
import { ViewingStatusController } from '../controllers/ViewingStatusController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateViewingStatusDto, UpdateViewingStatusDto } from '../dtos/ViewingStatusDto';

const router = Router();
const ViewingStatusController = new ViewingStatusController();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', ViewingStatusController.findAll.bind(ViewingStatusController));
router.get('/search', ViewingStatusController.search.bind(ViewingStatusController));
router.get('/:id', ViewingStatusController.findOne.bind(ViewingStatusController));
router.post('/', ViewingStatusController.create.bind(ViewingStatusController));
router.put('/:id', ViewingStatusController.update.bind(ViewingStatusController));
router.delete('/:id', ViewingStatusController.remove.bind(ViewingStatusController));

export default router;
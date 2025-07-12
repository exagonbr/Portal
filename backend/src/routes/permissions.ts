import { Router } from 'express';
import PermissionsController from '../controllers/PermissionsController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const permissionsController = new PermissionsController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', permissionsController.findAll.bind(permissionsController));
router.get('/:id', permissionsController.findById.bind(permissionsController));
router.post('/', permissionsController.create.bind(permissionsController));
router.put('/:id', permissionsController.update.bind(permissionsController));
router.delete('/:id', permissionsController.delete.bind(permissionsController));

export default router;

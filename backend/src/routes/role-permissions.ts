import { Router } from 'express';
import { RolePermissionsController } from '../controllers/RolePermissionsController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateRolePermissionsDto, UpdateRolePermissionsDto } from '../dtos/RolePermissionsDto';

const router = Router();
const RolePermissionsController = new RolePermissionsController();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', RolePermissionsController.findAll.bind(RolePermissionsController));
router.get('/search', RolePermissionsController.search.bind(RolePermissionsController));
router.get('/:id', RolePermissionsController.findOne.bind(RolePermissionsController));
router.post('/', RolePermissionsController.create.bind(RolePermissionsController));
router.put('/:id', RolePermissionsController.update.bind(RolePermissionsController));
router.delete('/:id', RolePermissionsController.remove.bind(RolePermissionsController));

export default router;
import { Router } from 'express';
import rolePermissionsController from '../controllers/RolePermissionsController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateRolePermissionsDto, UpdateRolePermissionsDto } from '../dtos/RolePermissionsDto';

const router = Router();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', rolePermissionsController.getAll.bind(rolePermissionsController));
router.get('/search', rolePermissionsController.search.bind(rolePermissionsController));
router.get('/:id', rolePermissionsController.getById.bind(rolePermissionsController));
router.post('/', rolePermissionsController.create.bind(rolePermissionsController));
router.put('/:id', rolePermissionsController.update.bind(rolePermissionsController));
router.delete('/:id', rolePermissionsController.delete.bind(rolePermissionsController));

export default router;
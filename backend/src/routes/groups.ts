import { Router } from 'express';
import GroupController from '../controllers/GroupController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.use(requireAuth);

// Rota para estatísticas (deve vir antes das rotas com parâmetros)
router.get('/stats', GroupController.getStats);

// Rotas CRUD básicas
router.get('/', GroupController.getAll);
router.get('/:id', GroupController.getById);
router.post('/', GroupController.create);
router.put('/:id', GroupController.update);
router.delete('/:id', GroupController.delete);

// Rotas de Membros
router.get('/:id/members', GroupController.getMembers);
router.post('/:id/members', GroupController.addMember);
router.delete('/:id/members/:userId', GroupController.removeMember);

// Rotas de Permissões
router.get('/:id/permissions', GroupController.getPermissions);
router.post('/:id/permissions', GroupController.setPermission);

export default router;
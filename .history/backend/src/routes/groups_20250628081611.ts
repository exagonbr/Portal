import { Router } from 'express';
import { GroupController } from '../controllers/GroupController';
import { GroupService } from '../services/GroupService';
import { GroupRepository } from '../repositories/GroupRepository';
import db from '../config/database';

const router = Router();

// Inicializar dependências
const groupRepository = new GroupRepository(db);
const groupService = new GroupService(groupRepository);
const groupController = new GroupController(groupService);

// Middleware de autenticação (implementar conforme necessário)
// router.use(authMiddleware);

// Rotas de grupos
router.get('/stats', (req, res) => groupController.getGroupStats(req, res));
router.get('/', (req, res) => groupController.getGroups(req, res));
router.post('/', (req, res) => groupController.createGroup(req, res));
router.get('/:id', (req, res) => groupController.getGroupById(req, res));
router.put('/:id', (req, res) => groupController.updateGroup(req, res));
router.delete('/:id', (req, res) => groupController.deleteGroup(req, res));

// Rotas de membros do grupo
router.get('/:id/members', (req, res) => groupController.getGroupMembers(req, res));
router.post('/:id/members', (req, res) => groupController.addGroupMember(req, res));
router.post('/:id/members/bulk', (req, res) => groupController.bulkAddMembers(req, res));
router.delete('/:id/members/:userId', (req, res) => groupController.removeGroupMember(req, res));

// Rotas de permissões do grupo
router.get('/:id/permissions', (req, res) => groupController.getGroupPermissions(req, res));
router.put('/:id/permissions', (req, res) => groupController.setGroupPermission(req, res));
router.delete('/:id/permissions', (req, res) => groupController.removeGroupPermission(req, res));
router.post('/:id/permissions/bulk', (req, res) => groupController.bulkSetGroupPermissions(req, res));

// Rotas de clonagem
router.post('/:id/clone', (req, res) => groupController.cloneGroup(req, res));

export default router;

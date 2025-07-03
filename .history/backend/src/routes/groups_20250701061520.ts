import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { GroupController } from '../controllers/GroupController';
import { GroupService } from '../services/GroupService';
import { GroupRepository } from '../repositories/GroupRepository';
import db from '../config/database';

const router = express.Router();

// Inicializar dependências
const groupRepository = new GroupRepository(db);
const groupService = new GroupService(groupRepository);
const groupController = new GroupController(groupService);

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);

// Middleware para verificar role de professor ou administrador
const requireTeacherOrAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER', 'TEACHER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas professores e administradores podem gerenciar grupos'
    });
  }
  
  next();
};

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

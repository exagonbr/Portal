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

// Rotas de permissões contextuais de usuários
router.get('/users/:userId/effective', (req, res) => groupController.getUserEffectivePermissions(req, res));
router.put('/users/:userId/contextual', (req, res) => groupController.setUserContextualPermission(req, res));

export default router;

import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken, authorizeRoles, authorizePermissions } from '../middleware/authMiddleware';

const router = Router();
const userController = new UserController();

// Rotas públicas (não precisam de autenticação)

// Rotas protegidas (precisam de autenticação)
router.use(authenticateToken);

// Listar todos os usuários (apenas admin e gestores)
router.get(
  '/',
  authorizeRoles('admin', 'institution_manager', 'school_manager'),
  userController.getAllUsers
);

// Buscar usuário por ID
router.get('/:id', userController.getUserById);

// Atualizar usuário (apenas admin ou o próprio usuário)
router.put('/:id', userController.updateUser);

// Deletar usuário (apenas admin)
router.delete(
  '/:id',
  authorizeRoles('admin'),
  userController.deleteUser
);

// Rotas específicas para gestão de usuários

// Listar usuários por instituição
router.get(
  '/institution/:institutionId',
  authorizePermissions('manage_users'),
  userController.getUsersByInstitution
);

// Listar usuários por escola
router.get(
  '/school/:schoolId',
  authorizePermissions('manage_users'),
  userController.getUsersBySchool
);

// Listar usuários por turma
router.get(
  '/class/:classId',
  authorizePermissions('view_class_members'),
  userController.getUsersByClass
);

// Atribuir papel a usuário
router.post(
  '/:id/role',
  authorizeRoles('admin', 'institution_manager'),
  userController.assignRole
);

// Adicionar usuário a turma
router.post(
  '/:id/class/:classId',
  authorizePermissions('manage_classes'),
  userController.addToClass
);

// Remover usuário de turma
router.delete(
  '/:id/class/:classId',
  authorizePermissions('manage_classes'),
  userController.removeFromClass
);

// Ativar/desativar usuário
router.patch(
  '/:id/status',
  authorizeRoles('admin', 'institution_manager', 'school_manager'),
  userController.toggleUserStatus
);

export default router;
import { Router } from 'express';
import { UserController } from '../controllers/refactored/UserController';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();
const userController = new UserController();

// Rotas protegidas (precisam de autenticação)
router.use(authenticateToken);

// Listar todos os usuários (apenas admin e gestores)
router.get(
  '/',
  authorizeRoles('admin', 'institution_manager', 'school_manager'),
  userController.getAll
);

// Buscar perfil do usuário autenticado
router.get('/me', userController.getProfile);

// Atualizar perfil do usuário autenticado
router.put('/me', userController.updateProfile);

// Alterar senha do usuário autenticado
router.post('/me/change-password', userController.changePassword);

// Buscar cursos do usuário autenticado
router.get('/me/courses', userController.getMyCourses);

// Buscar usuários (com filtros)
router.get('/search', userController.searchUsers);

// Buscar usuário por email
router.get('/by-email/:email', userController.getByEmail);

// Buscar usuário por username
router.get('/by-username/:username', userController.getByUsername);

// Buscar usuário por ID
router.get('/:id', userController.getById);

// Buscar cursos de um usuário específico
router.get('/:id/courses', userController.getUserCourses);

// Atualizar usuário (apenas admin ou o próprio usuário)
router.put('/:id', userController.update);

// Deletar usuário (apenas admin)
router.delete(
  '/:id',
  authorizeRoles('admin'),
  userController.delete
);

export default router;
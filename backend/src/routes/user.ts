import { Router } from 'express';
import UserController from '../controllers/UserController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const userController = new UserController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', userController.findAll.bind(userController));
router.get('/:id', userController.findById.bind(userController));
router.post('/', userController.create.bind(userController));
router.put('/:id', userController.update.bind(userController));
router.delete('/:id', userController.delete.bind(userController));

export default router;

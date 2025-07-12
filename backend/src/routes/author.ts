import { Router } from 'express';
import AuthorController from '../controllers/AuthorController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const authorController = new AuthorController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', authorController.findAll.bind(authorController));
router.get('/:id', authorController.findById.bind(authorController));
router.post('/', authorController.create.bind(authorController));
router.put('/:id', authorController.update.bind(authorController));
router.delete('/:id', authorController.delete.bind(authorController));

export default router;

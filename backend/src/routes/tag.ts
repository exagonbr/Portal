import { Router } from 'express';
import TagController from '../controllers/TagController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const tagController = new TagController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', tagController.findAll.bind(tagController));
router.get('/:id', tagController.findById.bind(tagController));
router.post('/', tagController.create.bind(tagController));
router.put('/:id', tagController.update.bind(tagController));
router.delete('/:id', tagController.delete.bind(tagController));

export default router;

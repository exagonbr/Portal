import { Router } from 'express';
import { QuestionController } from '../controllers/QuestionController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const questionController = new QuestionController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', questionController.findAll.bind(questionController));
router.get('/:id', questionController.findById.bind(questionController));
router.post('/', questionController.create.bind(questionController));
router.put('/:id', questionController.update.bind(questionController));
router.delete('/:id', questionController.delete.bind(questionController));

export default router;

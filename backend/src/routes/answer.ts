import { Router } from 'express';
import { AnswerController } from '../controllers/AnswerController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const answerController = new AnswerController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', answerController.findAll.bind(answerController));
router.get('/:id', answerController.findById.bind(answerController));
router.post('/', answerController.create.bind(answerController));
router.put('/:id', answerController.update.bind(answerController));
router.delete('/:id', answerController.delete.bind(answerController));

export default router;

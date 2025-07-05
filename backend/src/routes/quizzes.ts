import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import QuizController from '../controllers/QuizController';

const router = Router();

router.use(requireAuth);

router.get('/', QuizController.getAll);
router.post('/', QuizController.create);
router.get('/:id', QuizController.getById);
router.put('/:id', QuizController.update);
router.delete('/:id', QuizController.delete);

export default router;
import express from 'express';
import { QuestionController } from '../controllers/QuestionController';
import { requireAuth } from '../middleware/requireAuth';

const router = express.Router();
const questionController = new QuestionController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas básicas CRUD
router.get('/', questionController.getAll.bind(questionController));
router.get('/stats', questionController.getStats.bind(questionController));
router.get('/tv-show/:tvShowId', questionController.getByTvShow.bind(questionController));
router.get('/episode/:episodeId', questionController.getByEpisode.bind(questionController));
router.get('/:id', questionController.getById.bind(questionController));
router.post('/', questionController.create.bind(questionController));
router.put('/:id', questionController.update.bind(questionController));
router.delete('/:id', questionController.delete.bind(questionController));

// Rotas especiais
router.patch('/:id/soft-delete', questionController.softDelete.bind(questionController));
router.patch('/:id/restore', questionController.restore.bind(questionController));

export default router; 
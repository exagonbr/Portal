import { Router } from 'express';
import GenreController from '../controllers/GenreController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const genreController = new GenreController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', genreController.findAll.bind(genreController));
router.get('/:id', genreController.findById.bind(genreController));
router.post('/', genreController.create.bind(genreController));
router.put('/:id', genreController.update.bind(genreController));
router.delete('/:id', genreController.delete.bind(genreController));

export default router;

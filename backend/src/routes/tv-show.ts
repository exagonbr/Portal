import { Router } from 'express';
import { TvShowController } from '../controllers/TvShowController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateTvShowDto, UpdateTvShowDto } from '../dtos/TvShowDto';

const router = Router();
const TvShowController = new TvShowController();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', TvShowController.findAll.bind(TvShowController));
router.get('/search', TvShowController.search.bind(TvShowController));
router.get('/:id', TvShowController.findOne.bind(TvShowController));
router.post('/', TvShowController.create.bind(TvShowController));
router.put('/:id', TvShowController.update.bind(TvShowController));
router.delete('/:id', TvShowController.remove.bind(TvShowController));

export default router;
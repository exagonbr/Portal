import { Router } from 'express';
import tvShowController from '../controllers/TvShowController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateTvShowDto, UpdateTvShowDto } from '../dtos/TvShowDto';

const router = Router();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', tvShowController.getAll.bind(tvShowController));
router.get('/:id', tvShowController.getById.bind(tvShowController));
router.post('/', tvShowController.create.bind(tvShowController));
router.put('/:id', tvShowController.update.bind(tvShowController));
router.delete('/:id', tvShowController.delete.bind(tvShowController));

export default router;
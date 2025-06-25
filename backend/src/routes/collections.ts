import { Router } from 'express';
import { TVShowController } from '../controllers/TVShowController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

// Rotas para coleções
router.get('/', TVShowController.getAllCollections);
router.get('/search', TVShowController.searchCollections);
router.get('/popular', TVShowController.getPopularCollections);
router.get('/top-rated', TVShowController.getTopRatedCollections);
router.get('/recent', TVShowController.getRecentCollections);
router.get('/:id', TVShowController.getCollectionById);

export default router; 
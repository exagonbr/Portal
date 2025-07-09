import { Router } from 'express';
import { WatchlistEntryController } from '../controllers/WatchlistEntryController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const watchlistEntryController = new WatchlistEntryController();

// Middleware de autenticação
router.use(requireAuth);

// Rotas CRUD
router.get('/', watchlistEntryController.getAll.bind(watchlistEntryController));
router.get('/:id', watchlistEntryController.getById.bind(watchlistEntryController));
router.post('/', watchlistEntryController.create.bind(watchlistEntryController));
router.put('/:id', watchlistEntryController.update.bind(watchlistEntryController));
router.delete('/:id', watchlistEntryController.delete.bind(watchlistEntryController));

export default router;
import { Router } from 'express';
import { WatchlistEntryController } from '../controllers/WatchlistEntryController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const watchlist_entryController = new WatchlistEntryController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', watchlist_entryController.findAll.bind(watchlist_entryController));
router.get('/:id', watchlist_entryController.findById.bind(watchlist_entryController));
router.post('/', watchlist_entryController.create.bind(watchlist_entryController));
router.put('/:id', watchlist_entryController.update.bind(watchlist_entryController));
router.delete('/:id', watchlist_entryController.delete.bind(watchlist_entryController));

export default router;

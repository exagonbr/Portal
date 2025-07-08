import { Router } from 'express';
import { WatchlistEntryController } from '../controllers/WatchlistEntryController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateWatchlistEntryDto, UpdateWatchlistEntryDto } from '../dtos/WatchlistEntryDto';

const router = Router();
const WatchlistEntryController = new WatchlistEntryController();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', WatchlistEntryController.findAll.bind(WatchlistEntryController));
router.get('/search', WatchlistEntryController.search.bind(WatchlistEntryController));
router.get('/:id', WatchlistEntryController.findOne.bind(WatchlistEntryController));
router.post('/', WatchlistEntryController.create.bind(WatchlistEntryController));
router.put('/:id', WatchlistEntryController.update.bind(WatchlistEntryController));
router.delete('/:id', WatchlistEntryController.remove.bind(WatchlistEntryController));

export default router;
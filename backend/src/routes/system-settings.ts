import { Router } from 'express';
import systemSettingsController from '../controllers/SystemSettingsController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateSystemSettingsDto, UpdateSystemSettingsDto } from '../dtos/SystemSettingsDto';

const router = Router();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', systemSettingsController.getAll.bind(systemSettingsController));
router.get('/search', systemSettingsController.search.bind(systemSettingsController));
router.get('/:id', systemSettingsController.getById.bind(systemSettingsController));
router.post('/', systemSettingsController.create.bind(systemSettingsController));
router.put('/:id', systemSettingsController.update.bind(systemSettingsController));
router.delete('/:id', systemSettingsController.delete.bind(systemSettingsController));

export default router;
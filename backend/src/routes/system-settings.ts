import { Router } from 'express';
import { SystemSettingsController } from '../controllers/SystemSettingsController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateSystemSettingsDto, UpdateSystemSettingsDto } from '../dtos/SystemSettingsDto';

const router = Router();
const SystemSettingsController = new SystemSettingsController();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', SystemSettingsController.findAll.bind(SystemSettingsController));
router.get('/search', SystemSettingsController.search.bind(SystemSettingsController));
router.get('/:id', SystemSettingsController.findOne.bind(SystemSettingsController));
router.post('/', SystemSettingsController.create.bind(SystemSettingsController));
router.put('/:id', SystemSettingsController.update.bind(SystemSettingsController));
router.delete('/:id', SystemSettingsController.remove.bind(SystemSettingsController));

export default router;
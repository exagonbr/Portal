import { Router } from 'express';
import SystemSettingsController from '../controllers/SystemSettingsController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const system_settingsController = new SystemSettingsController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', system_settingsController.findAll.bind(system_settingsController));
router.get('/:id', system_settingsController.findById.bind(system_settingsController));
router.post('/', system_settingsController.create.bind(system_settingsController));
router.put('/:id', system_settingsController.update.bind(system_settingsController));
router.delete('/:id', system_settingsController.delete.bind(system_settingsController));

export default router;

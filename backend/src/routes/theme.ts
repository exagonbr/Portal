import { Router } from 'express';
import ThemeController from '../controllers/ThemeController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const themeController = new ThemeController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', themeController.getAll.bind(themeController));
router.get('/:id', themeController.getById.bind(themeController));
router.post('/', themeController.create.bind(themeController));
router.put('/:id', themeController.update.bind(themeController));
router.delete('/:id', themeController.delete.bind(themeController));

export default router;

import { Router } from 'express';
import { ProfileController } from '../controllers/ProfileController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const profileController = new ProfileController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', profileController.findAll.bind(profileController));
router.get('/:id', profileController.findById.bind(profileController));
router.post('/', profileController.create.bind(profileController));
router.put('/:id', profileController.update.bind(profileController));
router.delete('/:id', profileController.delete.bind(profileController));

export default router;

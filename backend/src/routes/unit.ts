import { Router } from 'express';
import { UnitController } from '../controllers/UnitController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const unitController = new UnitController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', unitController.findAll.bind(unitController));
router.get('/:id', unitController.findById.bind(unitController));
router.post('/', unitController.create.bind(unitController));
router.put('/:id', unitController.update.bind(unitController));
router.delete('/:id', unitController.delete.bind(unitController));

export default router;

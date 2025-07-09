import { Router } from 'express';
import { EducationCyclesController } from '../controllers/EducationCyclesController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const education_cyclesController = new EducationCyclesController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', education_cyclesController.findAll.bind(education_cyclesController));
router.get('/:id', education_cyclesController.findById.bind(education_cyclesController));
router.post('/', education_cyclesController.create.bind(education_cyclesController));
router.put('/:id', education_cyclesController.update.bind(education_cyclesController));
router.delete('/:id', education_cyclesController.delete.bind(education_cyclesController));

export default router;

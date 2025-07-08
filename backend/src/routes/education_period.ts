import { Router } from 'express';
import { EducationPeriodController } from '../controllers/EducationPeriodController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const education_periodController = new EducationPeriodController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', education_periodController.findAll.bind(education_periodController));
router.get('/:id', education_periodController.findById.bind(education_periodController));
router.post('/', education_periodController.create.bind(education_periodController));
router.put('/:id', education_periodController.update.bind(education_periodController));
router.delete('/:id', education_periodController.delete.bind(education_periodController));

export default router;

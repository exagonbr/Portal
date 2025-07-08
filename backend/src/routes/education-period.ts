import { Router } from 'express';
import { EducationPeriodController } from '../controllers/EducationPeriodController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateEducationPeriodDto, UpdateEducationPeriodDto } from '../dtos/EducationPeriodDto';

const router = Router();
const EducationPeriodController = new EducationPeriodController();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', EducationPeriodController.findAll.bind(EducationPeriodController));
router.get('/search', EducationPeriodController.search.bind(EducationPeriodController));
router.get('/:id', EducationPeriodController.findOne.bind(EducationPeriodController));
router.post('/', EducationPeriodController.create.bind(EducationPeriodController));
router.put('/:id', EducationPeriodController.update.bind(EducationPeriodController));
router.delete('/:id', EducationPeriodController.remove.bind(EducationPeriodController));

export default router;
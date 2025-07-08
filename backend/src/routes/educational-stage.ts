import { Router } from 'express';
import { EducationalStageController } from '../controllers/EducationalStageController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateEducationalStageDto, UpdateEducationalStageDto } from '../dtos/EducationalStageDto';

const router = Router();
const EducationalStageController = new EducationalStageController();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', EducationalStageController.findAll.bind(EducationalStageController));
router.get('/search', EducationalStageController.search.bind(EducationalStageController));
router.get('/:id', EducationalStageController.findOne.bind(EducationalStageController));
router.post('/', EducationalStageController.create.bind(EducationalStageController));
router.put('/:id', EducationalStageController.update.bind(EducationalStageController));
router.delete('/:id', EducationalStageController.remove.bind(EducationalStageController));

export default router;
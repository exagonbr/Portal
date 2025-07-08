import { Router } from 'express';
import { EducationalStageController } from '../controllers/EducationalStageController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const educational_stageController = new EducationalStageController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', educational_stageController.findAll.bind(educational_stageController));
router.get('/:id', educational_stageController.findById.bind(educational_stageController));
router.post('/', educational_stageController.create.bind(educational_stageController));
router.put('/:id', educational_stageController.update.bind(educational_stageController));
router.delete('/:id', educational_stageController.delete.bind(educational_stageController));

export default router;

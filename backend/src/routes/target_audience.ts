import { Router } from 'express';
import TargetAudienceController from '../controllers/TargetAudienceController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const target_audienceController = new TargetAudienceController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', target_audienceController.findAll.bind(target_audienceController));
router.get('/:id', target_audienceController.findById.bind(target_audienceController));
router.post('/', target_audienceController.create.bind(target_audienceController));
router.put('/:id', target_audienceController.update.bind(target_audienceController));
router.delete('/:id', target_audienceController.delete.bind(target_audienceController));

export default router;

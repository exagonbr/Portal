import { Router } from 'express';
import { TargetAudienceController } from '../controllers/TargetAudienceController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateTargetAudienceDto, UpdateTargetAudienceDto } from '../dtos/TargetAudienceDto';

const router = Router();
const TargetAudienceController = new TargetAudienceController();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', TargetAudienceController.findAll.bind(TargetAudienceController));
router.get('/search', TargetAudienceController.search.bind(TargetAudienceController));
router.get('/:id', TargetAudienceController.findOne.bind(TargetAudienceController));
router.post('/', TargetAudienceController.create.bind(TargetAudienceController));
router.put('/:id', TargetAudienceController.update.bind(TargetAudienceController));
router.delete('/:id', TargetAudienceController.remove.bind(TargetAudienceController));

export default router;
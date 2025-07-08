import { Router } from 'express';
import { SecurityPoliciesController } from '../controllers/SecurityPoliciesController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateSecurityPoliciesDto, UpdateSecurityPoliciesDto } from '../dtos/SecurityPoliciesDto';

const router = Router();
const SecurityPoliciesController = new SecurityPoliciesController();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', SecurityPoliciesController.findAll.bind(SecurityPoliciesController));
router.get('/search', SecurityPoliciesController.search.bind(SecurityPoliciesController));
router.get('/:id', SecurityPoliciesController.findOne.bind(SecurityPoliciesController));
router.post('/', SecurityPoliciesController.create.bind(SecurityPoliciesController));
router.put('/:id', SecurityPoliciesController.update.bind(SecurityPoliciesController));
router.delete('/:id', SecurityPoliciesController.remove.bind(SecurityPoliciesController));

export default router;
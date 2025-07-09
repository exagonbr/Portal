import { Router } from 'express';
import securityPoliciesController from '../controllers/SecurityPoliciesController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateSecurityPoliciesDto, UpdateSecurityPoliciesDto } from '../dtos/SecurityPoliciesDto';

const router = Router();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', securityPoliciesController.getAll.bind(securityPoliciesController));
router.get('/search', securityPoliciesController.search.bind(securityPoliciesController));
router.get('/:id', securityPoliciesController.getById.bind(securityPoliciesController));
router.post('/', securityPoliciesController.create.bind(securityPoliciesController));
router.put('/:id', securityPoliciesController.update.bind(securityPoliciesController));
router.delete('/:id', securityPoliciesController.delete.bind(securityPoliciesController));

export default router;
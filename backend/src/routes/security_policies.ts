import { Router } from 'express';
import { SecurityPoliciesController } from '../controllers/SecurityPoliciesController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const security_policiesController = new SecurityPoliciesController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', security_policiesController.findAll.bind(security_policiesController));
router.get('/:id', security_policiesController.findById.bind(security_policiesController));
router.post('/', security_policiesController.create.bind(security_policiesController));
router.put('/:id', security_policiesController.update.bind(security_policiesController));
router.delete('/:id', security_policiesController.delete.bind(security_policiesController));

export default router;

import { Router } from 'express';
import { InstitutionController } from '../controllers/InstitutionController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const institutionController = new InstitutionController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', institutionController.findAll.bind(institutionController));
router.get('/:id', institutionController.findById.bind(institutionController));
router.post('/', institutionController.create.bind(institutionController));
router.put('/:id', institutionController.update.bind(institutionController));
router.delete('/:id', institutionController.delete.bind(institutionController));

export default router;

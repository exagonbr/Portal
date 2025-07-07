import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import UnitController from '../controllers/UnitController';

const router = Router();

// Comentado temporariamente para teste
// router.use(requireAuth);

// Rotas básicas CRUD
router.get('/', UnitController.getAll);
router.post('/', UnitController.create);
router.get('/search', UnitController.search);
router.get('/active', UnitController.getActive);
router.get('/institution/:institutionId', UnitController.getByInstitution);
router.get('/:id', UnitController.getById);
router.put('/:id', UnitController.update);
router.delete('/:id', UnitController.delete);
router.post('/:id/soft-delete', UnitController.softDelete);

export default router;
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import RoleController from '../controllers/RoleController';

const router = Router();

router.use(requireAuth);

router.get('/', RoleController.getAll);
router.post('/', RoleController.create);
router.get('/:id', RoleController.getById);
router.put('/:id', RoleController.update);
router.delete('/:id', RoleController.delete);
router.patch('/:id/status', RoleController.toggleStatus);

export default router;
import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import UserClassController from '../controllers/UserClassController';

const router = Router();

router.use(requireAuth);

router.get('/', UserClassController.getAll);
router.post('/', UserClassController.create);
router.get('/:id', UserClassController.getById);
router.put('/:id', UserClassController.update);
router.delete('/:id', UserClassController.delete);
router.patch('/:id/status', UserClassController.toggleStatus);

export default router;
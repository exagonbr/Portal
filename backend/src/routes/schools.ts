import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import SchoolController from '../controllers/SchoolController';

const router = Router();

router.use(requireAuth);

router.get('/', SchoolController.getAll);
router.post('/', SchoolController.create);
router.get('/:id', SchoolController.getById);
router.put('/:id', SchoolController.update);
router.delete('/:id', SchoolController.delete);
router.patch('/:id/status', SchoolController.toggleStatus);

export default router;
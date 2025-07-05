import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import SubjectController from '../controllers/SubjectController';

const router = Router();

router.use(requireAuth);

router.get('/', SubjectController.getAll);
router.post('/', SubjectController.create);
router.get('/:id', SubjectController.getById);
router.put('/:id', SubjectController.update);
router.delete('/:id', SubjectController.delete);
router.patch('/:id/status', SubjectController.toggleStatus);

export default router;
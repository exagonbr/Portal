import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import subjectController from '../controllers/SubjectController';

const router = Router();

router.use(requireAuth);

router.get('/', subjectController.getAll.bind(subjectController));
router.post('/', subjectController.create.bind(subjectController));
router.get('/:id', subjectController.getById.bind(subjectController));
router.put('/:id', subjectController.update.bind(subjectController));
router.delete('/:id', subjectController.delete.bind(subjectController));
router.patch('/:id/toggle-status', subjectController.toggleStatus.bind(subjectController));
router.get('/search', subjectController.search.bind(subjectController));
router.get('/active', subjectController.getActive.bind(subjectController));

export default router;
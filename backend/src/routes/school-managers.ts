import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import SchoolManagerController from '../controllers/SchoolManagerController';

const router = Router();

router.use(requireAuth);

router.get('/', SchoolManagerController.getAll);
router.post('/', SchoolManagerController.create);
router.get('/:id', SchoolManagerController.getById);
router.put('/:id', SchoolManagerController.update);
router.delete('/:id', SchoolManagerController.delete);
router.patch('/:id/status', SchoolManagerController.toggleStatus);

export default router;
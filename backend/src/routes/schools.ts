import { Router } from 'express';
import SchoolController from '../controllers/SchoolController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.use(requireAuth);

router.get('/', SchoolController.getAll);
router.get('/:id', SchoolController.getById);
router.post('/', SchoolController.create);
router.put('/:id', SchoolController.update);
router.delete('/:id', SchoolController.delete);

export default router;
import { Router } from 'express';
import InstitutionController from '../controllers/InstitutionController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.use(requireAuth);

router.get('/', InstitutionController.getAll);
router.get('/:id', InstitutionController.getById);
router.post('/', InstitutionController.create);
router.put('/:id', InstitutionController.update);
router.delete('/:id', InstitutionController.delete);

export default router;
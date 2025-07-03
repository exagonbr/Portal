import { Router } from 'express';
import { InstitutionController } from '../controllers/InstitutionController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const institutionController = new InstitutionController();

router.use(authMiddleware);

router.get('/', institutionController.list);
router.get('/search', institutionController.search);
router.get('/:id', institutionController.getById);
router.post('/', institutionController.create);
router.put('/:id', institutionController.update);
router.delete('/:id', institutionController.delete);

export default router; 
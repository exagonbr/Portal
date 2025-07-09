import { Router } from 'express';
import educationPeriodController from '../controllers/EducationPeriodController';

const router = Router();

router.get('/', educationPeriodController.getAll.bind(educationPeriodController));
router.get('/search', educationPeriodController.search.bind(educationPeriodController));
router.get('/active', educationPeriodController.getActive.bind(educationPeriodController));
router.get('/:id', educationPeriodController.getById.bind(educationPeriodController));
router.post('/', educationPeriodController.create.bind(educationPeriodController));
router.put('/:id', educationPeriodController.update.bind(educationPeriodController));
router.put('/:id/toggle-status', educationPeriodController.toggleStatus.bind(educationPeriodController));
router.delete('/:id', educationPeriodController.delete.bind(educationPeriodController));

export default router;
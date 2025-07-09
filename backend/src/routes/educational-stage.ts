import { Router } from 'express';
import educationalStageController from '../controllers/EducationalStageController';

const router = Router();

router.get('/', educationalStageController.getAll.bind(educationalStageController));
router.get('/search', educationalStageController.search.bind(educationalStageController));
router.get('/active', educationalStageController.getActive.bind(educationalStageController));
router.get('/grade/:grade', educationalStageController.getByGrade.bind(educationalStageController));
router.get('/uuid/:uuid', educationalStageController.getByUuid.bind(educationalStageController));
router.get('/:id', educationalStageController.getById.bind(educationalStageController));
router.post('/', educationalStageController.create.bind(educationalStageController));
router.put('/:id', educationalStageController.update.bind(educationalStageController));
router.delete('/:id', educationalStageController.delete.bind(educationalStageController));

export default router;
import { Router } from 'express';
import { ActivitySummariesController } from '../controllers/ActivitySummariesController';

const router = Router();
const activitySummariesController = new ActivitySummariesController();

router.get('/', activitySummariesController.findAll.bind(activitySummariesController));
router.get('/:id', activitySummariesController.findById.bind(activitySummariesController));
router.post('/', activitySummariesController.create.bind(activitySummariesController));
router.put('/:id', activitySummariesController.update.bind(activitySummariesController));
router.delete('/:id', activitySummariesController.delete.bind(activitySummariesController));

export default router;
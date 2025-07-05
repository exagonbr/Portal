import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import DashboardController from '../controllers/DashboardController';

const router = Router();

router.use(requireAuth);

router.get('/system', DashboardController.getSystemDashboard);

export default router;
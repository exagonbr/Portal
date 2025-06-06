import { Router } from 'express';
import institutionsRoutes from './institutions';
import unitsRoutes from './units';
import coursesRoutes from './courses';
import classesRoutes from './classes';

const router = Router();

router.use('/institutions', institutionsRoutes);
router.use('/units', unitsRoutes);
router.use('/courses', coursesRoutes);
router.use('/classes', classesRoutes);

export default router; 
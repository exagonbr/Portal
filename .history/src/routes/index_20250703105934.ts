import { Router } from 'express';

import institutionsRoutes from './institutions';
import unitsRoutes from './units';
import coursesRoutes from './courses';
import classesRoutes from './classes';
import rolesRoutes from './roles';
import authRoutes from './auth';

const router = Router();

// Configurar rotas
router.use('/auth', authRoutes);
router.use('/institutions', institutionsRoutes);
router.use('/units', unitsRoutes);
router.use('/courses', coursesRoutes);
router.use('/roles', rolesRoutes);
router.use('/classes', classesRoutes);

export default router;

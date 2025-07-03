import { Router } from 'express';

import institutionsRoutes from './institutions';
import unitsRoutes from './units';
import coursesRoutes from './courses';
import classesRoutes from './classes';
import rolesRoutes from './roles';
import { authService } from '../services/AuthService';

const router = Router();

// Configurar rotas de autenticação
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json(result);
});

router.post('/auth/logout', async (req, res) => {
  await authService.logout();
  res.json({ success: true });
});

// Configurar outras rotas
router.use('/institutions', institutionsRoutes);
router.use('/units', unitsRoutes);
router.use('/courses', coursesRoutes);
router.use('/roles', rolesRoutes);
router.use('/classes', classesRoutes);

export default router;

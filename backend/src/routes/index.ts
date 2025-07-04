import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';
import db from '../config/database';
import { requireAuth } from '../middleware/requireAuth';

// Importação das novas rotas
import authRouter from './auth';
import classesRouter from './classes';
import coursesRouter from './courses';
import groupsRouter from './groups';
import institutionsRouter from './institutions';
import notificationsRouter from './notifications';
import schoolsRouter from './schools';
import settingsRouter from './settings';
import usersRouter from './users';
import videoCollectionsRouter from './video-collections';

const router = express.Router();

// Documentação da API
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Portal Educacional API Documentation'
}));

router.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Rotas Públicas
router.use('/auth', authRouter);

// Rotas Protegidas
router.use('/classes', requireAuth, classesRouter);
router.use('/courses', requireAuth, coursesRouter);
router.use('/groups', requireAuth, groupsRouter);
router.use('/institutions', requireAuth, institutionsRouter);
router.use('/notifications', requireAuth, notificationsRouter);
router.use('/schools', requireAuth, schoolsRouter);
router.use('/settings', requireAuth, settingsRouter);
router.use('/users', requireAuth, usersRouter);
router.use('/video-collections', requireAuth, videoCollectionsRouter);

// Rotas que ainda precisam ser migradas ou que possuem dependências específicas

export default router;
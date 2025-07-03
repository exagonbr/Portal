import express from 'express';
// import swaggerUi from 'swagger-ui-express'; // DESABILITADO TEMPORARIAMENTE
import { swaggerSpec } from '../config/swagger';
import { createAwsRoutes } from './awsRoutes';
import db from '../config/database';

// API Routes
import pushSubscriptionRoutes from './pushSubscription';
import notificationsRoutes from './notifications';
import institutionsPublicRouter from './institutions.public';
import institutionsRouter from './institutions';
import usersRouter from './users';
import usersDebugRouter from './users-debug';
import coursesRouter from './courses';
import modulesRouter from './modules';
import lessonsRouter from './lessons';
import booksRouter from './books';
import videosRouter from './videos';
import videoFileRouter from './video-file';
import annotationsRouter from './annotations';
import highlightsRouter from './highlights';
import rolesRouter from './roles';
import permissionsRouter from './permissions';
import groupsRouter from './groups';
import contextualPermissionsRouter from './permissions';
import quizzesRouter from './quizzes';
import chatsRouter from './chats';
import forumRouter from './forum';
import contentCollectionsRouter from './content-collections';
import collectionsRouter from './collections';
import videoCollectionsRouter from './video-collections';
import tvShowCompleteRouter from './tvShowComplete';
import authRouter from './auth';
import sessionsRouter from './sessions';
import dashboardRouter from './dashboard';
// import settingsRouter from './settings.routes';
import settingsRouter from './settings-simple.routes';
import queueRouter from './queue';
import cacheRouter from './cache';
import teachersRouter from './teachers';
import studentsRouter from './students';
import schoolsRouter from './schools.routes';
import unitsRouter from './units';
import notificationLogsRouter from './notification-logs';
import certificatesRouter from './certificates';

const router = express.Router();

// SWAGGER UI DESABILITADO TEMPORARIAMENTE PARA EVITAR LOOPS
// router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
//   explorer: true,
//   customCss: '.swagger-ui .topbar { display: none }',
//   customSiteTitle: 'Portal Sabercon API Documentation'
// }));

// Rota temporária para /docs (evitar loop)
router.get('/docs', (req, res) => {
  res.json({ 
    message: 'API Documentation temporariamente desabilitada para evitar loops',
    status: 'disabled',
    alternative: '/api/docs.json para especificação OpenAPI',
    timestamp: new Date().toISOString(),
    swagger_spec_url: '/api/docs.json'
  });
});

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Documentation in JSON format
router.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// API Routes
router.use('/push-subscriptions', pushSubscriptionRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/institutions', institutionsRouter); // Rotas administrativas (com autenticação)
router.use('/institutions-public', institutionsPublicRouter); // Rotas públicas
router.use('/users', usersRouter);
router.use('/users-debug', usersDebugRouter);
router.use('/courses', coursesRouter);
router.use('/modules', modulesRouter);
router.use('/lessons', lessonsRouter);
router.use('/books', booksRouter);
router.use('/videos', videosRouter);
router.use('/video-file', videoFileRouter);
router.use('/annotations', annotationsRouter);
router.use('/highlights', highlightsRouter);
router.use('/roles', rolesRouter);
router.use('/permissions', permissionsRouter);
router.use('/groups', groupsRouter);
router.use('/contextual-permissions', contextualPermissionsRouter);
router.use('/quizzes', quizzesRouter);
router.use('/chats', chatsRouter);
router.use('/forum', forumRouter);
router.use('/content-collections', contentCollectionsRouter);
router.use('/collections', collectionsRouter);
router.use('/video-collections', videoCollectionsRouter);
router.use('/tv-shows', tvShowCompleteRouter);
router.use('/auth', authRouter);
router.use('/sessions', sessionsRouter);
router.use('/dashboard', dashboardRouter);
router.use('/aws', createAwsRoutes(db));
router.use('/settings', settingsRouter);
router.use('/queue', queueRouter);
router.use('/cache', cacheRouter);
router.use('/teachers', teachersRouter);
router.use('/students', studentsRouter);
router.use('/schools', schoolsRouter);
router.use('/units', unitsRouter);
router.use('/notification-logs', notificationLogsRouter);
router.use('/certificates', certificatesRouter);

export default router;

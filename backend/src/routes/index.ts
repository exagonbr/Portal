

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';
import { createAwsRoutes } from './awsRoutes';
import db from '../config/database';
import { requireAuth } from '../middleware/requireAuth'; // Import the new requireAuth middleware

// API Routes
import pushSubscriptionRoutes from './pushSubscription';
import notificationsRoutes from './notifications';
import institutionsPublicRouter from './institutions.public';
import institutionsRouter from './institutions';
import publicRouter from './public';
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
import certificatesRouter from './certificates'; // Habilitado novamente com busca implementada
// import certificatesRouter from './certificates-temp'; // Usando versão temporária com dados mockados

const router = express.Router();

router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Portal Educacional API Documentation'
}));

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Setup endpoint (development only)
router.post('/setup', async (req, res) => {
  try {
    // Temporarily allow in any environment for initial setup
    // if (process.env.NODE_ENV === 'production') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Setup não permitido em produção'
    //   });
    // }

    // Import AuthService here to avoid circular dependencies
    const { AuthService } = await import('../services/AuthService');
    
    // Create default roles and admin user
    await AuthService.createDefaultRoles();
    await AuthService.createDefaultAdminUser();

    return res.json({
      success: true,
      message: 'Setup concluído com sucesso',
      credentials: {
        email: 'admin@portal.com',
        password: 'admin123'
      }
    });
  } catch (error: any) {
    console.error('Erro no setup:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro no setup',
      error: error.message
    });
  }
});

// API Documentation in JSON format
router.get('/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Public routes (no authentication required)
router.use('/auth', authRouter); // Authentication routes (login, refresh, logout)
router.use('/public', publicRouter); // General public routes
router.use('/institutions-public', institutionsPublicRouter); // Public institution routes

// Protected routes (authentication required)
router.use('/push-subscriptions', requireAuth, pushSubscriptionRoutes);
router.use('/notifications', requireAuth, notificationsRoutes);
router.use('/institutions', requireAuth, institutionsRouter); // Administrative institution routes
router.use('/users', requireAuth, usersRouter);
router.use('/users-debug', requireAuth, usersDebugRouter);
router.use('/courses', requireAuth, coursesRouter);
router.use('/modules', requireAuth, modulesRouter);
router.use('/lessons', requireAuth, lessonsRouter);
router.use('/books', requireAuth, booksRouter);
router.use('/videos', requireAuth, videosRouter);
router.use('/video-file', requireAuth, videoFileRouter);
router.use('/annotations', requireAuth, annotationsRouter);
router.use('/highlights', requireAuth, highlightsRouter);
router.use('/roles', requireAuth, rolesRouter);
router.use('/permissions', requireAuth, permissionsRouter);
router.use('/groups', requireAuth, groupsRouter);
router.use('/contextual-permissions', requireAuth, contextualPermissionsRouter);
router.use('/quizzes', requireAuth, quizzesRouter);
router.use('/chats', requireAuth, chatsRouter);
router.use('/forum', requireAuth, forumRouter);
router.use('/content-collections', requireAuth, contentCollectionsRouter);
router.use('/collections', requireAuth, collectionsRouter);
router.use('/video-collections', requireAuth, videoCollectionsRouter);
router.use('/tv-shows', requireAuth, tvShowCompleteRouter);
router.use('/sessions', requireAuth, sessionsRouter);
router.use('/dashboard', requireAuth, dashboardRouter);
router.use('/aws', requireAuth, createAwsRoutes(db));
router.use('/settings', requireAuth, settingsRouter);
router.use('/queue', requireAuth, queueRouter);
router.use('/cache', requireAuth, cacheRouter);
router.use('/teachers', requireAuth, teachersRouter);
router.use('/students', requireAuth, studentsRouter);
router.use('/schools', requireAuth, schoolsRouter);
router.use('/units', requireAuth, unitsRouter);
router.use('/notification-logs', requireAuth, notificationLogsRouter);
router.use('/certificates', requireAuth, certificatesRouter);

export default router;

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from '../config/swagger';
import { createAwsRoutes } from './awsRoutes';
import { createAwsAdminRoutes } from './awsAdminRoutes';
import db from '../config/database';

// API Routes
import pushSubscriptionRoutes from './pushSubscription';
import notificationsRoutes from './notifications';
import institutionsRouter from './institutions';
import usersRouter from './users';
import coursesRouter from './courses';
import modulesRouter from './modules';
import lessonsRouter from './lessons';
import booksRouter from './books';
import videosRouter from './videos';
import tvshowsRouter from './tvshows';
import annotationsRouter from './annotations';
import highlightsRouter from './highlights';
import rolesRouter from './roles';
import permissionsRouter from './permissions';
import quizzesRouter from './quizzes';
import chatsRouter from './chats';
import forumRouter from './forum';
import contentCollectionsRouter from './content-collections';
import authRouter from './auth';
import sessionsRouter from './sessions';
import dashboardRouter from './dashboard';
import cacheRouter from './cache';
import adminRouter from './adminRoutes';
import queueRouter from './queue';

const router = express.Router();

// Swagger UI route
router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Portal Sabercon API Documentation'
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

// API Routes
router.use('/push-subscriptions', pushSubscriptionRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/institutions', institutionsRouter);
router.use('/users', usersRouter);
router.use('/courses', coursesRouter);
router.use('/modules', modulesRouter);
router.use('/lessons', lessonsRouter);
router.use('/books', booksRouter);
router.use('/videos', videosRouter);
router.use('/tvshows', tvshowsRouter);
router.use('/annotations', annotationsRouter);
router.use('/highlights', highlightsRouter);
router.use('/roles', rolesRouter);
router.use('/permissions', permissionsRouter);
router.use('/quizzes', quizzesRouter);
router.use('/chats', chatsRouter);
router.use('/forum', forumRouter);
router.use('/content-collections', contentCollectionsRouter);
router.use('/auth', authRouter);
router.use('/sessions', sessionsRouter);
router.use('/dashboard', dashboardRouter);
router.use('/aws', createAwsRoutes(db));
router.use('/admin/aws', createAwsAdminRoutes(db));
router.use('/admin', adminRouter);
router.use('/cache', cacheRouter);
router.use('/queue', queueRouter);

export default router;

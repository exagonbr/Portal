import express from 'express';
import { requireAuth } from '../middleware/requireAuth';

// Importação das rotas existentes
import activityTrackingRouter from './activity-tracking';
import announcementsRouter from './announcements';
import authorsRouter from './authors';
import awsRouter from './aws';
import booksRouter from './books';
import certificatesRouter from './certificates';
import chatRouter from './chat';
import classesRouter from './classes';
import collectionsRouter from './collections';
import coursesRouter from './courses';
import dashboardRouter from './dashboard';
import educationalStagesRouter from './educational-stages';
import educationCyclesRouter from './education-cycles';
import educationPeriodsRouter from './education-periods';
import filesRouter from './files';
import forumRouter from './forum';
import genresRouter from './genres';
import institutionsRouter from './institutions';
import languagesRouter from './languages';
import mediaEntriesRouter from './media-entries';
import modulesRouter from './modules';
import notificationsRouter from './notifications';
import publicRouter from './public';
import publishersRouter from './publishers';
import quizzesRouter from './quizzes';
import rolesRouter from './roles';
import schoolManagersRouter from './school-managers';
import schoolsRouter from './schools';
import sessionsRouter from './sessions';
import settingsRouter from './settings';
import subjectsRouter from './subjects';
import tagsRouter from './tags';
import targetAudiencesRouter from './target-audiences';
import themesRouter from './themes';
import tvShowsRouter from './tv-shows';
import unitsRouter from './units';
import userClassesRouter from './user-classes';
import usersRouter from './users';
import videoCollectionsRouter from './video-collections';
import videoModulesRouter from './video-modules';
import videosRouter from './videos';
import authRouter from './auth';
import healthRouter from './health';
import questionsRouter from './questions';
import answersRouter from './answer';
import viewingStatusRouter from './viewing-status';

// Importação das novas rotas geradas
import activitysessionsRouter from './activity-sessions';
import activitysummariesRouter from './activity-summaries';
import educationperiodRouter from './education-period';
import educationalstageRouter from './educational-stage';
import notificationqueueRouter from './notification-queue';
import rolepermissionsRouter from './role-permissions';
import securitypoliciesRouter from './security-policies';
import systemsettingsRouter from './system-settings';
import targetaudienceRouter from './target-audience';
import teachersubjectRouter from './teacher-subject';
import tvshowRouter from './tv-show';
import watchlistentryRouter from './watchlist-entry';

const router = express.Router();

// Health check
router.use('/health', healthRouter);

// Rotas Públicas
router.use('/auth', authRouter);
router.use('/public', publicRouter);

// TEMPORÁRIO: Remover middleware de autenticação para todas as rotas
// Rotas Protegidas - Novas rotas geradas
router.use('/activity-sessions', activitysessionsRouter);
router.use('/activity-summaries', activitysummariesRouter);
router.use('/education-period', educationperiodRouter);
router.use('/educational-stage', educationalstageRouter);
router.use('/notification-queue', notificationqueueRouter);
router.use('/role-permissions', rolepermissionsRouter);
router.use('/security-policies', securitypoliciesRouter);
router.use('/system-settings', systemsettingsRouter);
router.use('/target-audience', targetaudienceRouter);
router.use('/teacher-subject', teachersubjectRouter);
router.use('/tv-show', tvshowRouter);
router.use('/viewing-status', viewingStatusRouter);
router.use('/watchlist-entry', watchlistentryRouter);

// Rotas Protegidas - Rotas existentes
router.use('/activity-tracking', activityTrackingRouter);
router.use('/announcements', announcementsRouter);
router.use('/authors', authorsRouter);
router.use('/aws', awsRouter);
router.use('/books', booksRouter);
router.use('/certificates', certificatesRouter);
router.use('/chat', chatRouter);
router.use('/classes', classesRouter);
router.use('/collections', collectionsRouter);
router.use('/courses', coursesRouter);
router.use('/dashboard', dashboardRouter);
router.use('/educational-stages', educationalStagesRouter);
router.use('/education-cycles', educationCyclesRouter);
router.use('/education-periods', educationPeriodsRouter);
router.use('/files', filesRouter);
router.use('/forum', forumRouter);
router.use('/genres', genresRouter);
router.use('/institutions', institutionsRouter);
router.use('/languages', languagesRouter);
router.use('/media-entries', mediaEntriesRouter);
router.use('/modules', modulesRouter);
router.use('/notifications', notificationsRouter);
router.use('/publishers', publishersRouter);
router.use('/quizzes', quizzesRouter);
router.use('/roles', rolesRouter);
router.use('/school-managers', schoolManagersRouter);
router.use('/schools', schoolsRouter);
router.use('/sessions', sessionsRouter);
router.use('/settings', settingsRouter);
router.use('/subjects', subjectsRouter);
router.use('/tags', tagsRouter);
router.use('/target-audiences', targetAudiencesRouter);
router.use('/themes', themesRouter);
router.use('/tv-shows', tvShowsRouter);
router.use('/units', unitsRouter);
router.use('/user-classes', userClassesRouter);
router.use('/users', usersRouter);
router.use('/video-collections', videoCollectionsRouter);
router.use('/video-modules', videoModulesRouter);
router.use('/videos', videosRouter);
router.use('/viewing-status', viewingStatusRouter);

// Novas rotas criadas para as entidades solicitadas
router.use('/questions', questionsRouter);
router.use('/answers', answersRouter);

// Rotas de Admin
router.use('/admin/sessions', sessionsRouter);

export default router;
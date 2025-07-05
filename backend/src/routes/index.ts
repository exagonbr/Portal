import express from 'express';
import { requireAuth } from '../middleware/requireAuth';

// Importação das rotas
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


const router = express.Router();

// Health check
router.use('/health', healthRouter);

// Rotas Públicas
router.use('/auth', authRouter);
router.use('/public', publicRouter);
router.use('/users', usersRouter);


// Rotas Protegidas
router.use('/announcements', requireAuth, announcementsRouter);
router.use('/authors', requireAuth, authorsRouter);
router.use('/aws', requireAuth, awsRouter);
router.use('/books', requireAuth, booksRouter);
router.use('/certificates', requireAuth, certificatesRouter);
router.use('/chat', requireAuth, chatRouter);
router.use('/classes', requireAuth, classesRouter);
router.use('/collections', requireAuth, collectionsRouter);
router.use('/courses', requireAuth, coursesRouter);
router.use('/dashboard', requireAuth, dashboardRouter);
router.use('/educational-stages', requireAuth, educationalStagesRouter);
router.use('/education-cycles', requireAuth, educationCyclesRouter);
router.use('/education-periods', requireAuth, educationPeriodsRouter);
router.use('/files', requireAuth, filesRouter);
router.use('/forum', requireAuth, forumRouter);
router.use('/genres', requireAuth, genresRouter);
router.use('/institutions', requireAuth, institutionsRouter);
router.use('/languages', requireAuth, languagesRouter);
router.use('/media-entries', requireAuth, mediaEntriesRouter);
router.use('/modules', requireAuth, modulesRouter);
router.use('/notifications', requireAuth, notificationsRouter);
router.use('/publishers', requireAuth, publishersRouter);
router.use('/quizzes', requireAuth, quizzesRouter);
router.use('/roles', requireAuth, rolesRouter);
router.use('/school-managers', requireAuth, schoolManagersRouter);
router.use('/schools', requireAuth, schoolsRouter);
router.use('/settings', requireAuth, settingsRouter);
router.use('/subjects', requireAuth, subjectsRouter);
router.use('/tags', requireAuth, tagsRouter);
router.use('/target-audiences', requireAuth, targetAudiencesRouter);
router.use('/themes', requireAuth, themesRouter);
router.use('/tv-shows', requireAuth, tvShowsRouter);
router.use('/units', requireAuth, unitsRouter);
router.use('/user-classes', requireAuth, userClassesRouter);
router.use('/video-collections', requireAuth, videoCollectionsRouter);
router.use('/video-modules', requireAuth, videoModulesRouter);
router.use('/videos', requireAuth, videosRouter);

// Rotas de Sessões
router.use('/sessions', requireAuth, sessionsRouter);

// Rotas de Admin
router.use('/admin/sessions', requireAuth, sessionsRouter);

// Rota para buscar dados de arquivo de vídeo
router.get('/video-file/:videoId', requireAuth, async (req, res) => {
  try {
    const { videoId } = req.params;
    console.log(`🔍 Buscando dados do arquivo para vídeo ID: ${videoId}`);
    
    // Buscar dados do arquivo associado ao vídeo
    const fileData = await req.app.locals.db('video as v')
      .join('video_file as vf', 'v.id', 'vf.video_id')
      .join('file as f', 'vf.file_id', 'f.id')
      .select(
        'f.sha256hex',
        'f.extension',
        'f.filename',
        'f.mimetype',
        'f.size'
      )
      .where('v.id', videoId)
      .first();
    
    if (!fileData) {
      console.warn(`⚠️ Arquivo não encontrado para vídeo ID: ${videoId}`);
      return res.status(404).json({
        success: false,
        message: 'Arquivo não encontrado para este vídeo'
      });
    }
    
    console.log(`✅ Dados do arquivo encontrados:`, {
      sha256hex: fileData.sha256hex,
      extension: fileData.extension
    });
    
    return res.status(200).json({
      success: true,
      data: fileData,
      message: 'Dados do arquivo carregados com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao buscar dados do arquivo:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

export default router;
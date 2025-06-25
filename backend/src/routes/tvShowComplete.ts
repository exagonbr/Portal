import { Router } from 'express';
import { TvShowCompleteController } from '../controllers/TvShowCompleteController';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/auth';

const router = Router();
const tvShowController = new TvShowCompleteController();

// Aplicar middleware de autenticação globalmente
router.use(authMiddleware);

// ===================== TV SHOW ROUTES =====================

// GET /api/tv-shows - Listar todas as coleções (com paginação e busca)
router.get('/', tvShowController.getAllTvShows);

// GET /api/tv-shows/:id - Buscar coleção por ID
router.get('/:id', tvShowController.getTvShowById);

// POST /api/tv-shows - Criar nova coleção (apenas admin/teacher)
router.post('/', requireRole(['admin', 'teacher']), tvShowController.createTvShow);

// PUT /api/tv-shows/:id - Atualizar coleção (apenas admin/teacher)
router.put('/:id', requireRole(['admin', 'teacher']), tvShowController.updateTvShow);

// DELETE /api/tv-shows/:id - Remover coleção (apenas admin)
router.delete('/:id', requireRole(['admin']), tvShowController.deleteTvShow);

// GET /api/tv-shows/:tvShowId/stats - Estatísticas da coleção
router.get('/:tvShowId/stats', tvShowController.getTvShowStats);

// ===================== VIDEO ROUTES =====================

// GET /api/tv-shows/:tvShowId/videos - Listar vídeos da coleção
router.get('/:tvShowId/videos', tvShowController.getVideosByTvShow);

// GET /api/tv-shows/:tvShowId/modules - Estrutura de módulos
router.get('/:tvShowId/modules', tvShowController.getModulesStructure);

// POST /api/tv-shows/videos - Criar novo vídeo (apenas admin/teacher)
router.post('/videos', requireRole(['admin', 'teacher']), tvShowController.createVideo);

// GET /api/tv-shows/videos/:id - Buscar vídeo por ID
router.get('/videos/:id', tvShowController.getVideoById);

// PUT /api/tv-shows/videos/:id - Atualizar vídeo (apenas admin/teacher)
router.put('/videos/:id', requireRole(['admin', 'teacher']), tvShowController.updateVideo);

// DELETE /api/tv-shows/videos/:id - Remover vídeo (apenas admin/teacher)
router.delete('/videos/:id', requireRole(['admin', 'teacher']), tvShowController.deleteVideo);

// ===================== QUESTION ROUTES =====================

// GET /api/tv-shows/:tvShowId/questions - Listar questões da coleção
router.get('/:tvShowId/questions', tvShowController.getQuestionsByTvShow);

// POST /api/tv-shows/questions - Criar nova questão (apenas admin/teacher)
router.post('/questions', requireRole(['admin', 'teacher']), tvShowController.createQuestion);

// GET /api/tv-shows/questions/:id - Buscar questão por ID
router.get('/questions/:id', tvShowController.getQuestionById);

// PUT /api/tv-shows/questions/:id - Atualizar questão (apenas admin/teacher)
router.put('/questions/:id', requireRole(['admin', 'teacher']), tvShowController.updateQuestion);

// DELETE /api/tv-shows/questions/:id - Remover questão (apenas admin/teacher)
router.delete('/questions/:id', requireRole(['admin', 'teacher']), tvShowController.deleteQuestion);

// ===================== ANSWER ROUTES =====================

// POST /api/tv-shows/answers - Criar nova resposta (apenas admin/teacher)
router.post('/answers', requireRole(['admin', 'teacher']), tvShowController.createAnswer);

// PUT /api/tv-shows/answers/:id - Atualizar resposta (apenas admin/teacher)
router.put('/answers/:id', requireRole(['admin', 'teacher']), tvShowController.updateAnswer);

// DELETE /api/tv-shows/answers/:id - Remover resposta (apenas admin/teacher)
router.delete('/answers/:id', requireRole(['admin', 'teacher']), tvShowController.deleteAnswer);

// ===================== FILE ROUTES =====================

// GET /api/tv-shows/:tvShowId/files - Listar arquivos da coleção
router.get('/:tvShowId/files', tvShowController.getFilesByTvShow);

// POST /api/tv-shows/files - Criar novo arquivo (apenas admin/teacher)
router.post('/files', requireRole(['admin', 'teacher']), tvShowController.createFile);

// DELETE /api/tv-shows/files/:id - Remover arquivo (apenas admin/teacher)
router.delete('/files/:id', requireRole(['admin', 'teacher']), tvShowController.deleteFile);

export default router; 
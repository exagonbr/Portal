import { Router } from 'express';
import { TvShowCompleteController } from '../controllers/TvShowCompleteController';
import { validateJWTSimple, requireRole } from '../middleware/auth';
import { optionalAuth } from '../middleware/sessionMiddleware';

const router = Router();
const tvShowController = new TvShowCompleteController();

// ===================== TV SHOW ROUTES =====================

// GET /api/tv-shows - Listar todas as coleções (com paginação e busca) - PÚBLICO
router.get('/', (req, res, next) => optionalAuth(req as any, res, next), tvShowController.getAllTvShows.bind(tvShowController));

// GET /api/tv-shows/:id - Buscar coleção por ID - PÚBLICO
router.get('/:id', (req, res, next) => optionalAuth(req as any, res, next), tvShowController.getTvShowById.bind(tvShowController));

// POST /api/tv-shows - Criar nova coleção (apenas admin/teacher)
router.post('/', validateJWTSimple, requireRole(['admin', 'teacher']), tvShowController.createTvShow.bind(tvShowController));

// PUT /api/tv-shows/:id - Atualizar coleção (apenas admin/teacher)
router.put('/:id', validateJWTSimple, requireRole(['admin', 'teacher']), tvShowController.updateTvShow.bind(tvShowController));

// DELETE /api/tv-shows/:id - Remover coleção (apenas admin)
router.delete('/:id', validateJWTSimple, requireRole(['admin']), tvShowController.deleteTvShow.bind(tvShowController));

// GET /api/tv-shows/:tvShowId/stats - Estatísticas da coleção - PÚBLICO
router.get('/:tvShowId/stats', (req, res, next) => optionalAuth(req as any, res, next), tvShowController.getTvShowStats.bind(tvShowController));

// ===================== VIDEO ROUTES =====================

// GET /api/tv-shows/:tvShowId/videos - Listar vídeos de uma coleção - PÚBLICO
router.get('/:tvShowId/videos', (req, res, next) => optionalAuth(req as any, res, next), tvShowController.getVideosByTvShow.bind(tvShowController));

// GET /api/tv-shows/:tvShowId/modules - Estrutura de módulos de vídeos - PÚBLICO
router.get('/:tvShowId/modules', (req, res, next) => optionalAuth(req as any, res, next), tvShowController.getVideosByTvShowGrouped.bind(tvShowController));

// POST /api/tv-shows/videos - Criar novo vídeo (apenas admin/teacher)
router.post('/videos', validateJWTSimple, requireRole(['admin', 'teacher']), tvShowController.createVideo);

// GET /api/tv-shows/videos/:id - Buscar vídeo por ID - PÚBLICO
router.get('/videos/:id', (req, res, next) => optionalAuth(req as any, res, next), tvShowController.getVideoById);

// PUT /api/tv-shows/videos/:id - Atualizar vídeo (apenas admin/teacher)
router.put('/videos/:id', validateJWTSimple, requireRole(['admin', 'teacher']), tvShowController.updateVideo);

// DELETE /api/tv-shows/videos/:id - Remover vídeo (apenas admin/teacher)
router.delete('/videos/:id', validateJWTSimple, requireRole(['admin', 'teacher']), tvShowController.deleteVideo);

// ===================== QUESTION ROUTES =====================

// GET /api/tv-shows/:tvShowId/questions - Listar questões da coleção - PÚBLICO
router.get('/:tvShowId/questions', (req, res, next) => optionalAuth(req as any, res, next), tvShowController.getQuestionsByTvShow);

// POST /api/tv-shows/questions - Criar nova questão (apenas admin/teacher)
router.post('/questions', validateJWTSimple, requireRole(['admin', 'teacher']), tvShowController.createQuestion);

// GET /api/tv-shows/questions/:id - Buscar questão por ID - PÚBLICO
router.get('/questions/:id', (req, res, next) => optionalAuth(req as any, res, next), tvShowController.getQuestionById);

// PUT /api/tv-shows/questions/:id - Atualizar questão (apenas admin/teacher)
router.put('/questions/:id', validateJWTSimple, requireRole(['admin', 'teacher']), tvShowController.updateQuestion);

// DELETE /api/tv-shows/questions/:id - Remover questão (apenas admin/teacher)
router.delete('/questions/:id', validateJWTSimple, requireRole(['admin', 'teacher']), tvShowController.deleteQuestion);

// ===================== ANSWER ROUTES =====================

// POST /api/tv-shows/answers - Criar nova resposta (apenas admin/teacher)
router.post('/answers', validateJWTSimple, requireRole(['admin', 'teacher']), tvShowController.createAnswer);

// PUT /api/tv-shows/answers/:id - Atualizar resposta (apenas admin/teacher)
router.put('/answers/:id', validateJWTSimple, requireRole(['admin', 'teacher']), tvShowController.updateAnswer);

// DELETE /api/tv-shows/answers/:id - Remover resposta (apenas admin/teacher)
router.delete('/answers/:id', validateJWTSimple, requireRole(['admin', 'teacher']), tvShowController.deleteAnswer);

// ===================== FILE ROUTES =====================

// GET /api/tv-shows/:tvShowId/files - Listar arquivos da coleção - PÚBLICO
router.get('/:tvShowId/files', (req, res, next) => optionalAuth(req as any, res, next), tvShowController.getFilesByTvShow);

// POST /api/tv-shows/files - Criar novo arquivo (apenas admin/teacher)
router.post('/files', validateJWTSimple, requireRole(['admin', 'teacher']), tvShowController.createFile);

// DELETE /api/tv-shows/files/:id - Remover arquivo (apenas admin/teacher)
router.delete('/files/:id', validateJWTSimple, requireRole(['admin', 'teacher']), tvShowController.deleteFile);

export default router; 
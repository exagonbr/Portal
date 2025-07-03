import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { TvShowCompleteController } from '../controllers/TvShowCompleteController';

const router = express.Router();
const tvShowCompleteController = new TvShowCompleteController();

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);


// Middleware para verificar role de administrador
const requireAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores podem gerenciar shows de TV'
    });
  }
  
  next();
};

// ===================== TV SHOW ROUTES =====================
// IMPORTANT: More specific routes must come before less specific ones.

// --- Search ---
router.get('/search', tvShowCompleteController.searchTvShows.bind(tvShowCompleteController));

// --- Standalone resource GETTERS (must come before general /:id) ---
router.get('/videos/:id', tvShowCompleteController.getVideoById.bind(tvShowCompleteController));
router.get('/questions/:id', tvShowCompleteController.getQuestionById.bind(tvShowCompleteController));

// --- Standalone resource CUD (admin only) ---
router.post('/videos', requireAdmin, tvShowCompleteController.createVideo.bind(tvShowCompleteController));
router.put('/videos/:id', requireAdmin, tvShowCompleteController.updateVideo.bind(tvShowCompleteController));
router.delete('/videos/:id', requireAdmin, tvShowCompleteController.deleteVideo.bind(tvShowCompleteController));

router.post('/questions', requireAdmin, tvShowCompleteController.createQuestion.bind(tvShowCompleteController));
router.put('/questions/:id', requireAdmin, tvShowCompleteController.updateQuestion.bind(tvShowCompleteController));
router.delete('/questions/:id', requireAdmin, tvShowCompleteController.deleteQuestion.bind(tvShowCompleteController));

router.post('/answers', requireAdmin, tvShowCompleteController.createAnswer.bind(tvShowCompleteController));
router.put('/answers/:id', requireAdmin, tvShowCompleteController.updateAnswer.bind(tvShowCompleteController));
router.delete('/answers/:id', requireAdmin, tvShowCompleteController.deleteAnswer.bind(tvShowCompleteController));

router.post('/files', requireAdmin, tvShowCompleteController.createFile.bind(tvShowCompleteController));
router.put('/files/:id', requireAdmin, tvShowCompleteController.updateFile.bind(tvShowCompleteController));
router.delete('/files/:id', requireAdmin, tvShowCompleteController.deleteFile.bind(tvShowCompleteController));

// --- Nested resource routes ---
router.get('/:tvShowId/stats', requireAdmin, tvShowCompleteController.getTvShowStats.bind(tvShowCompleteController));
router.get('/:tvShowId/videos/grouped', tvShowCompleteController.getVideosByTvShowGrouped.bind(tvShowCompleteController));
router.get('/:tvShowId/videos', tvShowCompleteController.getVideosByTvShow.bind(tvShowCompleteController));
router.get('/:tvShowId/questions', tvShowCompleteController.getQuestionsByTvShow.bind(tvShowCompleteController));
router.get('/:tvShowId/files', tvShowCompleteController.getFilesByTvShow.bind(tvShowCompleteController));
router.get('/questions/:questionId/answers', tvShowCompleteController.getAnswersByQuestion.bind(tvShowCompleteController));


// --- Main TV Show CRUD (least specific, so last) ---
router.get('/', tvShowCompleteController.getAllTvShows.bind(tvShowCompleteController));
router.post('/', requireAdmin, tvShowCompleteController.createTvShow.bind(tvShowCompleteController));

// This MUST be last for the GET routes with one parameter
router.get('/:id', tvShowCompleteController.getTvShowById.bind(tvShowCompleteController));

router.put('/:id', requireAdmin, tvShowCompleteController.updateTvShow.bind(tvShowCompleteController));
router.delete('/:id', requireAdmin, tvShowCompleteController.deleteTvShow.bind(tvShowCompleteController));

export default router;

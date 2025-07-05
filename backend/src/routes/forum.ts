import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import ForumController from '../controllers/ForumController';

const router = Router();

router.use(requireAuth);

// Rotas de Tópicos
router.get('/threads', ForumController.getThreads);
router.post('/threads', ForumController.createThread);
router.get('/threads/:id', ForumController.getThreadById);
router.put('/threads/:id', ForumController.updateThread);
router.delete('/threads/:id', ForumController.deleteThread);

// Rotas de Respostas
router.get('/threads/:threadId/replies', ForumController.getReplies);
router.post('/replies', ForumController.createReply);


export default router;
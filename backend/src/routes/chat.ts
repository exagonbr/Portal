import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import ChatController from '../controllers/ChatController';

const router = Router();

router.use(requireAuth);

router.get('/messages', ChatController.getMessages);
router.post('/messages', ChatController.sendMessage);

export default router;
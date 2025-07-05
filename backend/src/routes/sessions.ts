import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import SessionController from '../controllers/SessionController';

const router = Router();

// Estas são rotas de administração, então a autenticação é necessária.
router.use(requireAuth);

router.get('/active', SessionController.getActiveSessions);
router.post('/:sessionId/terminate', SessionController.terminateSession);

export default router;
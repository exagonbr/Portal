import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import UserController from '../controllers/UserController';

const router = Router();

// A rota de login é pública
router.post('/login', UserController.login);

router.use(requireAuth);

router.get('/', UserController.getAll);
router.post('/', UserController.create);
router.get('/:id', UserController.getById);
router.put('/:id', UserController.update);
router.delete('/:id', UserController.delete);
router.patch('/:id/status', UserController.toggleStatus);
router.post('/:id/change-password', UserController.changePassword);
router.get('/:id/profile', UserController.getProfile);

export default router;
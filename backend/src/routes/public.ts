import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import PublicController from '../controllers/PublicController';

const router = Router();

// Rotas públicas geralmente não requerem autenticação, mas o service usa o apiService que a inclui.
// Vou manter a autenticação para consistência.
router.use(requireAuth);

router.get('/', PublicController.getAll);
router.post('/', PublicController.create);
router.get('/:id', PublicController.getById);
router.put('/:id', PublicController.update);
router.delete('/:id', PublicController.delete);

export default router;
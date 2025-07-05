import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import FileController from '../controllers/FileController';

const router = Router();

// A rota de upload pode não precisar de autenticação, dependendo do caso de uso.
// Vamos manter requireAuth por padrão.
router.use(requireAuth);

router.post('/upload', FileController.upload);
router.get('/', FileController.getAll);
router.delete('/:id', FileController.delete);

export default router;
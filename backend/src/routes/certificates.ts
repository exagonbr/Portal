import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import certificateController from '../controllers/CertificateController';

const router = Router();

// Rotas públicas (sem autenticação)
router.get('/public/search', certificateController.searchPublic.bind(certificateController));

// Rotas protegidas (com autenticação)
router.use(requireAuth);

// Busca paginada com filtros
router.get('/', certificateController.findAll.bind(certificateController));

// Estatísticas
router.get('/stats', certificateController.getStats.bind(certificateController));

// CRUD básico
router.post('/', certificateController.create.bind(certificateController));
router.get('/:id', certificateController.getById.bind(certificateController));
router.put('/:id', certificateController.update.bind(certificateController));
router.delete('/:id', certificateController.delete.bind(certificateController));

export default router;
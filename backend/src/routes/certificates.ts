import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import CertificateController from '../controllers/CertificateController';

const router = Router();

// Rotas públicas (sem autenticação)
router.get('/public/search', CertificateController.searchPublic.bind(CertificateController));

// Rotas protegidas (com autenticação)
router.use(requireAuth);

// Busca paginada com filtros
router.get('/', CertificateController.findAll.bind(CertificateController));

// Estatísticas
router.get('/stats', CertificateController.getStats.bind(CertificateController));

// CRUD básico
router.post('/', CertificateController.create.bind(CertificateController));
router.get('/:id', CertificateController.getById.bind(CertificateController));
router.put('/:id', CertificateController.update.bind(CertificateController));
router.delete('/:id', CertificateController.delete.bind(CertificateController));

export default router;
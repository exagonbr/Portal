import { Router } from 'express';
import CertificateController from '../controllers/CertificateController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const certificateController = new CertificateController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', certificateController.findAll.bind(certificateController));
router.get('/:id', certificateController.findById.bind(certificateController));
router.post('/', certificateController.create.bind(certificateController));
router.put('/:id', certificateController.update.bind(certificateController));
router.delete('/:id', certificateController.delete.bind(certificateController));

export default router;

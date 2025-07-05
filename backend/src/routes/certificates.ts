import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import CertificateController from '../controllers/CertificateController';

const router = Router();

router.use(requireAuth);

router.get('/', CertificateController.getAll);
router.post('/', CertificateController.create);
router.get('/:id', CertificateController.getById);
router.put('/:id', CertificateController.update);
router.delete('/:id', CertificateController.delete);

export default router;
import { Router } from 'express';
import ReportController from '../controllers/ReportController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const reportController = new ReportController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', reportController.findAll.bind(reportController));
router.get('/:id', reportController.findById.bind(reportController));
router.post('/', reportController.create.bind(reportController));
router.put('/:id', reportController.update.bind(reportController));
router.delete('/:id', reportController.delete.bind(reportController));

export default router;

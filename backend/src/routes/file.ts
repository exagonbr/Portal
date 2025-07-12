import { Router } from 'express';
import FileController from '../controllers/FileController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const fileController = new FileController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', fileController.findAll.bind(fileController));
router.get('/:id', fileController.findById.bind(fileController));
router.post('/', fileController.create.bind(fileController));
router.put('/:id', fileController.update.bind(fileController));
router.delete('/:id', fileController.delete.bind(fileController));

export default router;

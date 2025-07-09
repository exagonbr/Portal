import { Router } from 'express';
import { TeacherSubjectController } from '../controllers/TeacherSubjectController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();
const teacher_subjectController = new TeacherSubjectController();

// Aplicar middleware de autenticação em todas as rotas
router.use(requireAuth);

// Rotas CRUD básicas
router.get('/', teacher_subjectController.findAll.bind(teacher_subjectController));
router.get('/:id', teacher_subjectController.findById.bind(teacher_subjectController));
router.post('/', teacher_subjectController.create.bind(teacher_subjectController));
router.put('/:id', teacher_subjectController.update.bind(teacher_subjectController));
router.delete('/:id', teacher_subjectController.delete.bind(teacher_subjectController));

export default router;

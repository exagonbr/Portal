import { Router } from 'express';
import { TeacherSubjectController } from '../controllers/TeacherSubjectController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateTeacherSubjectDto, UpdateTeacherSubjectDto } from '../dtos/TeacherSubjectDto';

const router = Router();
const TeacherSubjectController = new TeacherSubjectController();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', TeacherSubjectController.findAll.bind(TeacherSubjectController));
router.get('/search', TeacherSubjectController.search.bind(TeacherSubjectController));
router.get('/:id', TeacherSubjectController.findOne.bind(TeacherSubjectController));
router.post('/', TeacherSubjectController.create.bind(TeacherSubjectController));
router.put('/:id', TeacherSubjectController.update.bind(TeacherSubjectController));
router.delete('/:id', TeacherSubjectController.remove.bind(TeacherSubjectController));

export default router;
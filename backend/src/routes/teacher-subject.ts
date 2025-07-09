import { Router } from 'express';
import teacherSubjectController from '../controllers/TeacherSubjectController';
import { requireAuth } from '../middleware/requireAuth';
import { CreateTeacherSubjectDto, UpdateTeacherSubjectDto } from '../dtos/TeacherSubjectDto';

const router = Router();

// Aplicar middleware de autenticação
// Middleware aplicado no index.ts

// Rotas CRUD
router.get('/', teacherSubjectController.getAll.bind(teacherSubjectController));
router.get('/search', teacherSubjectController.search.bind(teacherSubjectController));
router.get('/:id', teacherSubjectController.getById.bind(teacherSubjectController));
router.post('/', teacherSubjectController.create.bind(teacherSubjectController));
router.put('/:id', teacherSubjectController.update.bind(teacherSubjectController));
router.delete('/:id', teacherSubjectController.delete.bind(teacherSubjectController));

export default router;
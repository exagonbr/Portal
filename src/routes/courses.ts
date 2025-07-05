import { Router } from 'express';
import { CourseController } from '../controllers/CourseController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const courseController = new CourseController();

router.use(authMiddleware);

router.get('/', courseController.list);
router.get('/search', courseController.search);
router.get('/:id', courseController.getById);
router.post('/', courseController.create);
router.put('/:id', courseController.update);
router.delete('/:id', courseController.delete);

// Rotas para gerenciamento de professores
router.post('/:id/teachers', courseController.addTeacher);
router.delete('/:id/teachers/:teacher_id', courseController.removeTeacher);

// Rotas para gerenciamento de alunos
router.post('/:id/students', courseController.addStudent);
router.delete('/:id/students/:student_id', courseController.removeStudent);

export default router; 
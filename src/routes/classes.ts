import { Router } from 'express';
import { ClassController } from '../controllers/ClassController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();
const classController = new ClassController();

router.use(authMiddleware);

router.get('/', classController.list);
router.get('/search', classController.search);
router.get('/:id', classController.getById);
router.post('/', classController.create);
router.put('/:id', classController.update);
router.delete('/:id', classController.delete);

// Rotas para gerenciamento de professores
router.post('/:id/teachers', classController.addTeacher);
router.delete('/:id/teachers/:teacher_id', classController.removeTeacher);

// Rotas para gerenciamento de alunos
router.post('/:id/students', classController.addStudent);
router.delete('/:id/students/:student_id', classController.removeStudent);

export default router; 
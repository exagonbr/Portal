import { Router } from 'express';
import CourseController from '../controllers/CourseController';
import { requireAuth } from '../middleware/requireAuth';

const router = Router();

router.use(requireAuth);

router.get('/', CourseController.getAll);
router.get('/:id', CourseController.getById);
router.post('/', CourseController.create);
router.put('/:id', CourseController.update);
router.delete('/:id', CourseController.delete);

// Rotas específicas de Course
router.get('/:id/students', CourseController.getStudents);
router.post('/:id/students', CourseController.addStudent);
router.delete('/:id/students/:studentId', CourseController.removeStudent);

export default router;
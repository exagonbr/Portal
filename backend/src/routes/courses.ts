import { Router } from 'express';
import { requireAuth } from '../middleware/requireAuth';

import CourseController from '../controllers/CourseController';

const router = Router();

router.use(requireAuth);

router.get('/', CourseController.getAll);
router.post('/', CourseController.create);
router.get('/:id', CourseController.getById);
router.put('/:id', CourseController.update);
router.delete('/:id', CourseController.delete);
router.patch('/:id/status', CourseController.toggleStatus);

// Rotas específicas de Course que não estão no service, mas no arquivo de rotas original
router.get('/:id/students', CourseController.getStudents);
router.post('/:id/students', CourseController.addStudent);
router.delete('/:id/students/:studentId', CourseController.removeStudent);


export default router;
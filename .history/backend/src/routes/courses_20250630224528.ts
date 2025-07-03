import express from 'express';
import { authenticateToken as authMiddleware, authorizeRoles as requireRole, authorizeInstitution as requireInstitution } from '../middleware/authMiddleware';
import { CourseController } from '../controllers/CourseController';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);
const courseController = new CourseController();

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: institution_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter courses by institution ID
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized
 */
router.get('/', requireInstitution, async (req, res) => {
  return courseController.getAll(req, res);
});

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Course found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 */
router.get('/:id', requireInstitution, async (req, res) => {
  return courseController.getById(req, res);
});

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - institution_id
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               institution_id:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Course created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Invalid input
 */
router.post('/', requireRole('admin', 'teacher'), requireInstitution, async (req, res) => {
  return courseController.create(req, res);
});

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Course updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 */
router.put('/:id', requireRole('admin', 'teacher'), requireInstitution, async (req, res) => {
  return courseController.update(req, res);
});

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Course deleted
 *       404:
 *         description: Course not found
 */
router.delete('/:id', requireRole('admin', 'SYSTEM_ADMIN'), requireInstitution, async (req, res) => {
  return courseController.delete(req, res);
});

/**
 * @swagger
 * /api/courses/{id}/modules:
 *   get:
 *     summary: Get all modules for a course
 *     tags: [Courses, Modules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of modules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Module'
 *       404:
 *         description: Course not found
 */
router.get('/:id/modules', requireInstitution, async (req, res) => {
  return courseController.getModules(req, res);
});

/**
 * @swagger
 * /api/courses/{id}/books:
 *   get:
 *     summary: Get all books for a course
 *     tags: [Courses, Books]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 *       404:
 *         description: Course not found
 */
router.get('/:id/books', requireInstitution, async (req, res) => {
  return courseController.getBooks(req, res);
});

/**
 * @swagger
 * /api/courses/{id}/videos:
 *   get:
 *     summary: Get all videos for a course
 *     tags: [Courses, Videos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of videos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Video'
 *       404:
 *         description: Course not found
 */
router.get('/:id/videos', requireInstitution, async (req, res) => {
  return courseController.getVideos(req, res);
});

/**
 * @swagger
 * /api/courses/{id}/teachers:
 *   get:
 *     summary: Get all teachers for a course
 *     tags: [Courses, Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of teachers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: Course not found
 */
router.get('/:id/teachers', requireInstitution, async (req, res) => {
  return courseController.getTeachers(req, res);
});

/**
 * @swagger
 * /api/courses/{id}/students:
 *   get:
 *     summary: Get all students for a course
 *     tags: [Courses, Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: List of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: Course not found
 */
router.get('/:id/students', requireInstitution, async (req, res) => {
  return courseController.getStudents(req, res);
});

/**
 * @swagger
 * /api/courses/{id}/teachers:
 *   post:
 *     summary: Add teacher to course
 *     tags: [Courses, Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Teacher added to course
 *       404:
 *         description: Course or teacher not found
 */
router.post('/:id/teachers', requireRole('admin', 'teacher'), requireInstitution, async (req, res) => {
  return courseController.addTeacher(req, res);
});

/**
 * @swagger
 * /api/courses/{id}/students:
 *   post:
 *     summary: Add student to course
 *     tags: [Courses, Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Student added to course
 *       404:
 *         description: Course or student not found
 */
router.post('/:id/students', requireRole('admin', 'teacher'), requireInstitution, async (req, res) => {
  return courseController.addStudent(req, res);
});

/**
 * @swagger
 * /api/courses/{id}/teachers/{userId}:
 *   delete:
 *     summary: Remove teacher from course
 *     tags: [Courses, Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Teacher removed from course
 *       404:
 *         description: Course or teacher not found
 */
router.delete('/:id/teachers/:userId', requireRole('admin', 'teacher'), requireInstitution, async (req, res) => {
  return courseController.removeTeacher(req, res);
});

/**
 * @swagger
 * /api/courses/{id}/students/{userId}:
 *   delete:
 *     summary: Remove student from course
 *     tags: [Courses, Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Student removed from course
 *       404:
 *         description: Course or student not found
 */
router.delete('/:id/students/:userId', requireRole('admin', 'teacher'), requireInstitution, async (req, res) => {
  return courseController.removeStudent(req, res);
});

export default router;

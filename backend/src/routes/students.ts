import express from 'express';
import { authenticateToken as authMiddleware } from '../middleware/authMiddleware';
import { CourseController } from '../controllers/CourseController';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);
const courseController = new CourseController();

/**
 * @swagger
 * /api/students/{id}/courses:
 *   get:
 *     summary: Get all courses by student ID
 *     tags: [Students, Courses]
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
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       404:
 *         description: Student not found
 */
router.get('/:id/courses', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required'
      });
    }

    const courses = await courseController.getCoursesByStudent(id);
    
    return res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving student courses',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 
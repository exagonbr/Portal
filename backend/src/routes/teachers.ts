import express from 'express';
import { validateJWT } from '../middleware/auth';
import { CourseController } from '../controllers/CourseController';

const router = express.Router();
const courseController = new CourseController();

/**
 * @swagger
 * /api/teachers/{id}/courses:
 *   get:
 *     summary: Get all courses by teacher ID
 *     tags: [Teachers, Courses]
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
 *         description: Teacher not found
 */
router.get('/:id/courses', validateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID is required'
      });
    }

    const courses = await courseController.getCoursesByTeacher(id);
    
    return res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error retrieving teacher courses',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 
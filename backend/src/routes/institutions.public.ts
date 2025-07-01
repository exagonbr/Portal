import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { InstitutionController } from '../controllers/refactored/InstitutionController';
import { param, query } from 'express-validator';

const router = express.Router();

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);

const institutionController = new InstitutionController();

const institutionTypesArray = ['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TECH_CENTER'];

// Validation middlewares
const validateQueryParams = [
  query('active').optional().isBoolean().withMessage('Active must be a boolean.'),
  query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000.'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer.'),
  query('search').optional().isString().withMessage('Search must be a string.'),
  query('type').optional().isIn(institutionTypesArray).withMessage(`Type must be one of: ${institutionTypesArray.join(', ')}`),
];

const validateIdParam = [
  param('id').isUUID().withMessage('ID must be a valid UUID.'),
];

const validateCodeParam = [
  param('code').isString().notEmpty().withMessage('Code is required.'),
];

/**
 * @swagger
 * /institutions:
 *   get:
 *     summary: Get all institutions with filters and pagination (public access)
 *     tags: [institutions]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name or code
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: ['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TECH_CENTER']
 *         description: Filter by institution type
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of institutions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Institution'
 */
router.get(
  '/',
  validateQueryParams,
  institutionController.getAll
);

/**
 * @swagger
 * /institutions/{id}:
 *   get:
 *     summary: Get institution by ID (public access)
 *     tags: [institutions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Institution ID
 *     responses:
 *       200:
 *         description: Institution found
 *       404:
 *         description: Institution not found
 */
router.get(
  '/:id',
  validateIdParam,
  institutionController.getById
);

/**
 * @swagger
 * /institutions/code/{code}:
 *   get:
 *     summary: Get institution by code (public access)
 *     tags: [institutions]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Institution code
 *     responses:
 *       200:
 *         description: Institution found
 *       404:
 *         description: Institution not found
 */
router.get(
  '/code/:code',
  validateCodeParam,
  institutionController.getByCode
);

/**
 * @swagger
 * /api/institutions-public:
 *   get:
 *     summary: Get public institution information
 *     tags: [InstitutionsPublic]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Public institution data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/InstitutionPublic'
 *       401:
 *         description: Unauthorized
 */
router.get('/', async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Public institutions - implementação pendente',
    data: []
  });
});

/**
 * @swagger
 * /api/institutions-public/{id}:
 *   get:
 *     summary: Get public information for a specific institution
 *     tags: [InstitutionsPublic]
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
 *         description: Public institution information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InstitutionPublic'
 *       404:
 *         description: Institution not found
 */
router.get('/:id', async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Public institution by ID - implementação pendente',
    data: null
  });
});

/**
 * @swagger
 * /api/institutions-public/{id}/courses:
 *   get:
 *     summary: Get public courses for an institution
 *     tags: [InstitutionsPublic]
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
 *         description: Public courses for institution
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CoursePublic'
 */
router.get('/:id/courses', async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Public institution courses - implementação pendente',
    data: []
  });
});

/**
 * @swagger
 * /api/institutions-public/{id}/stats:
 *   get:
 *     summary: Get public statistics for an institution
 *     tags: [InstitutionsPublic]
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
 *         description: Public institution statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCourses:
 *                       type: integer
 *                     totalStudents:
 *                       type: integer
 *                     establishedYear:
 *                       type: integer
 */
router.get('/:id/stats', async (req, res) => {
  // Implementation will be added in the controller
  res.json({
    success: true,
    message: 'Public institution stats - implementação pendente',
    data: {
      totalCourses: 0,
      totalStudents: 0,
      establishedYear: null
    }
  });
});

export default router;
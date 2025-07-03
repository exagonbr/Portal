import express from 'express';
import { optionalAuthMiddleware } from '../middleware/optionalAuth.middleware';
import { InstitutionController } from '../controllers/refactored/InstitutionController';
import { param, query } from 'express-validator';

const router = express.Router();

// Aplicar middleware de autenticação opcional em todas as rotas
router.use(optionalAuthMiddleware);
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

export default router;
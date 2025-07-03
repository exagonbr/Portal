import express from 'express';
import { requireAuth } from '../middleware/requireAuth';
import { InstitutionController } from '../controllers/refactored/InstitutionController';
import { body, param } from 'express-validator';

const router = express.Router();

// 🔐 APLICAR MIDDLEWARE UNIFICADO DE AUTENTICAÇÃO
router.use(requireAuth);

const institutionController = new InstitutionController();

// Middleware para verificar role de administrador
const requireAdmin = (req: any, res: any, next: any) => {
  const user = req.user;
  
  if (!['SYSTEM_ADMIN', 'INSTITUTION_MANAGER'].includes(user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - apenas administradores podem gerenciar instituições'
    });
  }
  
  next();
};

const institutionTypesArray = ['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TECH_CENTER'];

// Validation middlewares
const validateCreateInstitution = [
  body('name').isString().notEmpty().withMessage('Name is required and must be a string.'),
  body('code').isString().notEmpty().withMessage('Code is required and must be a string.'),
  body('type').isIn(institutionTypesArray).withMessage(`Type must be one of: ${institutionTypesArray.join(', ')}`),
  body('address').optional().isString().withMessage('Address must be a string.'),
  body('city').optional().isString().withMessage('City must be a string.'),
  body('state').optional().isString().withMessage('State must be a string.'),
  body('zip_code').optional().isString().withMessage('Zip code must be a string.'),
  body('country').optional().isString().withMessage('Country must be a string.'),
  body('phone').optional().isString().withMessage('Phone must be a string.'),
  body('email').optional().isEmail().withMessage('Email must be a valid email address.'),
  body('website').optional().isURL().withMessage('Website must be a valid URL.'),
  body('logo_url').optional().isURL().withMessage('Logo URL must be a valid URL.'),
  body('is_active').optional().isBoolean().withMessage('Is_active must be a boolean.'),
];

const validateUpdateInstitution = [
  param('id').isUUID().withMessage('ID must be a valid UUID.'),
  body('name').optional().isString().notEmpty().withMessage('Name must be a string.'),
  body('code').optional().isString().notEmpty().withMessage('Code must be a string.'),
  body('type').optional().isIn(institutionTypesArray).withMessage(`Type must be one of: ${institutionTypesArray.join(', ')}`),
  body('address').optional().isString().withMessage('Address must be a string.'),
  body('city').optional().isString().withMessage('City must be a string.'),
  body('state').optional().isString().withMessage('State must be a string.'),
  body('zip_code').optional().isString().withMessage('Zip code must be a string.'),
  body('country').optional().isString().withMessage('Country must be a string.'),
  body('phone').optional().isString().withMessage('Phone must be a string.'),
  body('email').optional().isEmail().withMessage('Email must be a valid email address.'),
  body('website').optional().isURL().withMessage('Website must be a valid URL.'),
  body('logo_url').optional().isURL().withMessage('Logo URL must be a valid URL.'),
  body('is_active').optional().isBoolean().withMessage('Is_active must be a boolean.'),
];

const validateIdParam = [
  param('id').isUUID().withMessage('ID must be a valid UUID.'),
];

const validateCodeParam = [
  param('code').isString().notEmpty().withMessage('Code is required.'),
];

/**
 * @swagger
 * tags:
 *   name: institution
 *   description: Institution management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Institution:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         type:
 *           type: string
 *           enum: ['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TECH_CENTER']
 *         address:
 *           type: string
 *         city:
 *           type: string
 *         state:
 *           type: string
 *         zip_code:
 *           type: string
 *         country:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         website:
 *           type: string
 *           format: url
 *         logo_url:
 *           type: string
 *           format: url
 *         is_active:
 *           type: boolean
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     CreateInstitutionDto:
 *       type: object
 *       required:
 *         - name
 *         - code
 *         - type
 *       properties:
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         type:
 *           type: string
 *           enum: ['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TECH_CENTER']
 *         # ... (outros campos opcionais do DTO)
 *     UpdateInstitutionDto:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         code:
 *           type: string
 *         type:
 *           type: string
 *           enum: ['SCHOOL', 'COLLEGE', 'UNIVERSITY', 'TECH_CENTER']
 *         # ... (outros campos opcionais do DTO)
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/institution:
 *   get:
 *     summary: Get all institution with filters and pagination
 *     tags: [institution]
 *     security:
 *       - bearerAuth: []
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
 *         name: is_active
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: ['name', 'code', 'type', 'created_at']
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: ['asc', 'desc']
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of institution
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
 *                 pagination:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', institutionController.getAll);

/**
 * @swagger
 * /api/institution/{id}:
 *   get:
 *     summary: Get institution by ID
 *     tags: [institution]
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
 *         description: Institution found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Institution'
 *       404:
 *         description: Institution not found
 */
router.get('/:id', validateIdParam, async (req: any, res: any) => {
  return institutionController.getById(req, res);
});

/**
 * @swagger
 * /api/institution/code/{code}:
 *   get:
 *     summary: Get institution by code
 *     tags: [institution]
 *     security:
 *       - bearerAuth: []
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
 * /api/institution/{id}/stats:
 *   get:
 *     summary: Get statistics for an institution
 *     tags: [institution]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Institution statistics
 *       404:
 *         description: Institution not found
 */
router.get(
  '/:id/stats',
  validateIdParam,
  institutionController.getStats
);

/**
 * @swagger
 * /api/institution:
 *   post:
 *     summary: Create a new institution
 *     tags: [institution]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateInstitutionDto'
 *     responses:
 *       201:
 *         description: Institution created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Institution'
 *       400:
 *         description: Invalid input
 */
router.post('/', requireAdmin, validateCreateInstitution, async (req, res) => {
  return institutionController.create(req, res);
});

/**
 * @swagger
 * /api/institution/{id}:
 *   put:
 *     summary: Update an institution
 *     tags: [institution]
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
 *             $ref: '#/components/schemas/UpdateInstitutionDto'
 *     responses:
 *       200:
 *         description: Institution updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Institution'
 *       404:
 *         description: Institution not found
 */
router.put('/:id', requireAdmin, validateUpdateInstitution, async (req, res) => {
  return institutionController.update(req, res);
});

/**
 * @swagger
 * /api/institution/{id}:
 *   delete:
 *     summary: Delete an institution
 *     tags: [institution]
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
 *         description: Institution deleted
 *       404:
 *         description: Institution not found
 */
router.delete('/:id', requireAdmin, validateIdParam, async (req, res) => {
  return institutionController.delete(req, res);
});

// Helper para definir parâmetros reutilizáveis no Swagger (opcional, mas bom para DRY)
/**
 * @swagger
 * components:
 *   parameters:
 *     idParam:
 *       name: id
 *       in: path
 *       required: true
 *       description: Institution ID
 *       schema:
 *         type: string
 *         format: uuid
 */

export default router;

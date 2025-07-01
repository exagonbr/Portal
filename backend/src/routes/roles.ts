import express from 'express';
import { authenticateToken as authMiddleware, authorizeRoles as requireRole } from '../middleware/authMiddleware';
import { RoleController } from '../controllers/refactored/RoleController';

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);
const roleController = new RoleController();

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [system, custom]
 *         description: Filter roles by type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter roles by status
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter roles by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in role name and description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/', requireRole('SYSTEM_ADMIN', 'INSTITUTION_MANAGER'), roleController.getAll);

/**
 * @swagger
 * /api/roles/search:
 *   get:
 *     summary: Search roles with filters and pagination
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [system, custom]
 *         description: Filter roles by type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter roles by status
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter roles by active status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in role name and description
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Role'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/search', requireRole('SYSTEM_ADMIN', 'INSTITUTION_MANAGER'), roleController.search);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
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
 *         description: Role found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *       404:
 *         description: Role not found
 */
router.get('/:id', requireRole('SYSTEM_ADMIN', 'INSTITUTION_MANAGER'), roleController.getById);

/**
 * @swagger
 * /api/roles/stats:
 *   get:
 *     summary: Get role statistics
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Role statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRoles:
 *                   type: integer
 *                 systemRoles:
 *                   type: integer
 *                 customRoles:
 *                   type: integer
 *                 activeRoles:
 *                   type: integer
 *                 inactiveRoles:
 *                   type: integer
 *                 totalUsers:
 *                   type: integer
 */
router.get('/stats', requireRole('SYSTEM_ADMIN', 'INSTITUTION_MANAGER'), roleController.getStats);

/**
 * @swagger
 * /api/roles/frontend:
 *   get:
 *     summary: Get roles formatted for frontend
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Frontend formatted roles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 systemRoles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExtendedRole'
 *                 customRoles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CustomRole'
 */
router.get('/frontend', requireRole('SYSTEM_ADMIN', 'INSTITUTION_MANAGER'), roleController.getRolesForFrontend);

/**
 * @swagger
 * /api/roles/permission-groups:
 *   get:
 *     summary: Get permission groups for frontend
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permission groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PermissionGroup'
 */
router.get('/permission-groups', requireRole('SYSTEM_ADMIN', 'INSTITUTION_MANAGER'), roleController.getPermissionGroups);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
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
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [system, custom]
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       201:
 *         description: Role created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *       400:
 *         description: Invalid input
 *       409:
 *         description: Role name already exists
 */
router.post('/', requireRole('SYSTEM_ADMIN'), roleController.create);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Roles]
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
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Role updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *       404:
 *         description: Role not found
 */
router.put('/:id', requireRole('SYSTEM_ADMIN'), roleController.update);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Delete a role
 *     tags: [Roles]
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
 *         description: Role deleted
 *       404:
 *         description: Role not found
 *       400:
 *         description: Cannot delete system role or role with users
 */
router.delete('/:id', requireRole('SYSTEM_ADMIN'), roleController.delete);

/**
 * @swagger
 * /api/roles/assign-teacher-role:
 *   post:
 *     summary: Assign TEACHER role to imported users
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teacher role assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updated:
 *                   type: integer
 *                   description: Number of users updated
 *       404:
 *         description: TEACHER role not found
 */
router.post('/assign-teacher-role', requireRole('SYSTEM_ADMIN'), roleController.assignTeacherRoleToImportedUsers);

export default router;

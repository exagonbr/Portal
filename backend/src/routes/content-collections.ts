import express from 'express';
import { validateJWT, requireRole, validateJWTSmart, requireRoleSmart } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/content-collections:
 *   get:
 *     summary: Get all content collections
 *     tags: [Content Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: subject
 *         schema:
 *           type: string
 *         description: Filter collections by subject
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter collections by tag
 *       - in: query
 *         name: created_by
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter collections by creator
 *     responses:
 *       200:
 *         description: List of content collections
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ContentCollection'
 *       401:
 *         description: Unauthorized
 */
router.get('/', validateJWTSmart, async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/content-collections/{id}:
 *   get:
 *     summary: Get content collection by ID
 *     tags: [Content Collections]
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
 *         description: Content collection found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContentCollection'
 *       404:
 *         description: Collection not found
 */
router.get('/:id', validateJWT, async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/content-collections:
 *   post:
 *     summary: Create a new content collection
 *     tags: [Content Collections]
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
 *               - subject
 *             properties:
 *               name:
 *                 type: string
 *               synopsis:
 *                 type: string
 *               cover_image:
 *                 type: string
 *               support_material:
 *                 type: string
 *               total_duration:
 *                 type: integer
 *                 description: Total duration in seconds
 *               subject:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Collection created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContentCollection'
 *       400:
 *         description: Invalid input
 */
router.post('/', validateJWTSmart, requireRoleSmart(['admin', 'teacher']), async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/content-collections/{id}:
 *   put:
 *     summary: Update a content collection
 *     tags: [Content Collections]
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
 *               synopsis:
 *                 type: string
 *               cover_image:
 *                 type: string
 *               support_material:
 *                 type: string
 *               total_duration:
 *                 type: integer
 *               subject:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Collection updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ContentCollection'
 *       404:
 *         description: Collection not found
 *       403:
 *         description: Not authorized to edit this collection
 */
router.put('/:id', validateJWT, requireRole(['admin', 'teacher']), async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/content-collections/{id}:
 *   delete:
 *     summary: Delete a content collection
 *     tags: [Content Collections]
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
 *         description: Collection deleted
 *       404:
 *         description: Collection not found
 *       403:
 *         description: Not authorized to delete this collection
 */
router.delete('/:id', validateJWT, requireRole(['admin', 'teacher']), async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/content-collections/{id}/modules:
 *   get:
 *     summary: Get modules for a content collection
 *     tags: [Content Collections]
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
 *         description: Collection modules
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CollectionModule'
 *       404:
 *         description: Collection not found
 */
router.get('/:id/modules', validateJWT, async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/content-collections/{id}/modules:
 *   post:
 *     summary: Add a module to a content collection
 *     tags: [Content Collections]
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
 *               - name
 *               - order
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               cover_image:
 *                 type: string
 *               video_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               order:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Module added to collection
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CollectionModule'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Collection not found
 *       403:
 *         description: Not authorized to modify this collection
 */
router.post('/:id/modules', validateJWT, requireRole(['admin', 'teacher']), async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/content-collections/modules/{moduleId}:
 *   put:
 *     summary: Update a collection module
 *     tags: [Content Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
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
 *               cover_image:
 *                 type: string
 *               video_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *               order:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Module updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CollectionModule'
 *       404:
 *         description: Module not found
 *       403:
 *         description: Not authorized to modify this module
 */
router.put('/modules/:moduleId', validateJWT, requireRole(['admin', 'teacher']), async (req, res) => {
  // Implementation will be added in the controller
});

/**
 * @swagger
 * /api/content-collections/modules/{moduleId}:
 *   delete:
 *     summary: Delete a collection module
 *     tags: [Content Collections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Module deleted
 *       404:
 *         description: Module not found
 *       403:
 *         description: Not authorized to delete this module
 */
router.delete('/modules/:moduleId', validateJWT, requireRole(['admin', 'teacher']), async (req, res) => {
  // Implementation will be added in the controller
});

export default router;

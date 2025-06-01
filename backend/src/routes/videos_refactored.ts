import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { VideoController } from '../controllers/VideoController';
import { validateJWT } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/videos:
 *   get:
 *     tags:
 *       - Videos
 *     summary: Get all videos
 *     description: Returns a list of videos with optional filtering and pagination
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of videos to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Number of videos to skip
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for video title, name or overview
 *       - in: query
 *         name: show_id
 *         schema:
 *           type: integer
 *         description: Filter by show ID
 *       - in: query
 *         name: class
 *         schema:
 *           type: string
 *         description: Filter by video class
 *     responses:
 *       200:
 *         description: Videos retrieved successfully
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
 *                     $ref: '#/components/schemas/Video'
 *                 total:
 *                   type: integer
 */
router.get(
  '/',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
    query('show_id').optional().isInt({ min: 1 }),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      return VideoController.getVideos(req, res, () => {});
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
);

/**
 * @swagger
 * /api/videos/{id}:
 *   get:
 *     tags:
 *       - Videos
 *     summary: Get video by ID
 *     description: Returns a single video by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Video'
 *       404:
 *         description: Video not found
 */
router.get(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      return VideoController.getVideoById(req, res, () => {});
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
);

/**
 * @swagger
 * /api/videos:
 *   post:
 *     tags:
 *       - Videos
 *     summary: Create a new video
 *     description: Creates a new video entry
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - class
 *             properties:
 *               class:
 *                 type: string
 *               title:
 *                 type: string
 *               name:
 *                 type: string
 *               overview:
 *                 type: string
 *               duration:
 *                 type: string
 *               show_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Video created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  validateJWT,
  [
    body('class').notEmpty().withMessage('Campo "class" é obrigatório'),
    body('title').optional().isString(),
    body('name').optional().isString(),
    body('overview').optional().isString(),
    body('duration').optional().isString(),
    body('show_id').optional().isInt({ min: 1 }),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      return VideoController.createVideo(req, res, () => {});
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
);

/**
 * @swagger
 * /api/videos/{id}:
 *   put:
 *     tags:
 *       - Videos
 *     summary: Update video
 *     description: Updates an existing video
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Video ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               class:
 *                 type: string
 *               title:
 *                 type: string
 *               name:
 *                 type: string
 *               overview:
 *                 type: string
 *               duration:
 *                 type: string
 *               show_id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Video updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Video not found
 */
router.put(
  '/:id',
  validateJWT,
  [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
    body('class').optional().isString(),
    body('title').optional().isString(),
    body('name').optional().isString(),
    body('overview').optional().isString(),
    body('duration').optional().isString(),
    body('show_id').optional().isInt({ min: 1 }),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      return VideoController.updateVideo(req, res, () => {});
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
);

/**
 * @swagger
 * /api/videos/{id}:
 *   delete:
 *     tags:
 *       - Videos
 *     summary: Delete video
 *     description: Deletes a video by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Video ID
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Video not found
 */
router.delete(
  '/:id',
  validateJWT,
  [
    param('id').isInt({ min: 1 }).withMessage('ID deve ser um número inteiro positivo'),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      return VideoController.deleteVideo(req, res, () => {});
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
);

/**
 * @swagger
 * /api/videos/show/{showId}:
 *   get:
 *     tags:
 *       - Videos
 *     summary: Get videos by show
 *     description: Returns all videos for a specific show
 *     parameters:
 *       - in: path
 *         name: showId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Show ID
 *     responses:
 *       200:
 *         description: Videos retrieved successfully
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
 *                     $ref: '#/components/schemas/Video'
 *                 total:
 *                   type: integer
 */
router.get(
  '/show/:showId',
  [
    param('showId').isInt({ min: 1 }).withMessage('Show ID deve ser um número inteiro positivo'),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      return VideoController.getVideosByShow(req, res, () => {});
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
);

/**
 * @swagger
 * /api/videos/search:
 *   get:
 *     tags:
 *       - Videos
 *     summary: Search videos
 *     description: Search videos by title, name or overview
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of results to return
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
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
 *                     $ref: '#/components/schemas/Video'
 *                 total:
 *                   type: integer
 */
router.get(
  '/search',
  [
    query('q').notEmpty().withMessage('Parâmetro de busca "q" é obrigatório'),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  async (req: express.Request, res: express.Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      return VideoController.searchVideos(req, res, () => {});
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
);

/**
 * @swagger
 * /api/videos/count:
 *   get:
 *     tags:
 *       - Videos
 *     summary: Get videos count
 *     description: Returns the total number of videos
 *     responses:
 *       200:
 *         description: Count retrieved successfully
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
 *                     count:
 *                       type: integer
 */
router.get('/count', VideoController.getVideosCount);

export default router; 
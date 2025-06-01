import { Router, Request, Response } from 'express';
import { TvShowRepository } from '../repositories/TvShowRepository';
import { AuthorRepository } from '../repositories/AuthorRepository';
import { validateJWT } from '../middleware/auth';

const router = Router();
const tvShowRepository = new TvShowRepository();
const authorRepository = new AuthorRepository();

/**
 * @swagger
 * /api/tvshows:
 *   get:
 *     summary: Get all TV shows
 *     tags: [TvShows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filter by genre
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: Get only featured shows
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit results
 *     responses:
 *       200:
 *         description: List of TV shows
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
 *                     $ref: '#/components/schemas/TvShow'
 */
router.get('/', validateJWT, async (req: Request, res: Response) => {
  try {
    const { genre, featured, search, limit } = req.query;
    const user = (req as any).user;
    let tvShows;

    if (search) {
      tvShows = await tvShowRepository.searchTvShows(
        search as string,
        user.institution_id
      );
    } else if (featured === 'true') {
      tvShows = await tvShowRepository.findFeatured(
        limit ? parseInt(limit as string) : 10
      );
    } else if (genre) {
      tvShows = await tvShowRepository.findByGenre(
        genre as string,
        limit ? parseInt(limit as string) : 20
      );
    } else {
      tvShows = await tvShowRepository.findByInstitution(user.institution_id);
    }

    return res.json({
      success: true,
      data: tvShows,
      total: tvShows.length
    });
  } catch (error) {
    console.error('Error fetching TV shows:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving TV shows',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/tvshows/{id}:
 *   get:
 *     summary: Get TV show by ID with episodes
 *     tags: [TvShows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: TV show ID
 *     responses:
 *       200:
 *         description: TV show details with episodes
 *       404:
 *         description: TV show not found
 */
router.get('/:id', validateJWT, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const tvShow = await tvShowRepository.getTvShowWithEpisodes(id);

    if (!tvShow) {
      return res.status(404).json({
        success: false,
        message: 'TV show not found'
      });
    }

    // Incrementar visualizações
    await tvShowRepository.updateStatistics(id, 'view');

    // Buscar autores
    const authors = await authorRepository.getContentAuthors(id, 'tv_show');

    return res.json({
      success: true,
      data: {
        ...tvShow,
        authors
      }
    });
  } catch (error) {
    console.error('Error fetching TV show:', error);
    return res.status(500).json({
      success: false,
      message: 'Error retrieving TV show',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/tvshows:
 *   post:
 *     summary: Create new TV show
 *     tags: [TvShows]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               synopsis:
 *                 type: string
 *               description:
 *                 type: string
 *               genre:
 *                 type: string
 *               target_audience:
 *                 type: string
 *               content_rating:
 *                 type: string
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               difficulty_level:
 *                 type: string
 *                 enum: [basic, intermediate, advanced]
 *               is_public:
 *                 type: boolean
 *               is_premium:
 *                 type: boolean
 *               is_featured:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: TV show created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/', validateJWT, async (req: Request, res: Response): Promise<Response> => {
  try {
    const user = (req as any).user;
    
    // Verificar se o usuário tem instituição
    if (!user.institution_id) {
      return res.status(400).json({
        success: false,
        message: 'User must be associated with an institution'
      });
    }

    const tvShowData = {
      ...req.body,
      created_by: user.id,
      institution_id: user.institution_id,
      created_at: new Date(),
      updated_at: new Date()
    };

    const tvShow = await tvShowRepository.create(tvShowData);

    return res.status(201).json({
      success: true,
      data: tvShow,
      message: 'TV show created successfully'
    });
  } catch (error) {
    console.error('Error creating TV show:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating TV show',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/tvshows/{id}:
 *   put:
 *     summary: Update TV show
 *     tags: [TvShows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               synopsis:
 *                 type: string
 *               description:
 *                 type: string
 *               genre:
 *                 type: string
 *               target_audience:
 *                 type: string
 *               content_rating:
 *                 type: string
 *               subjects:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               difficulty_level:
 *                 type: string
 *                 enum: [basic, intermediate, advanced]
 *               is_public:
 *                 type: boolean
 *               is_premium:
 *                 type: boolean
 *               is_featured:
 *                 type: boolean
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *     responses:
 *       200:
 *         description: TV show updated successfully
 *       404:
 *         description: TV show not found
 */
router.put('/:id', validateJWT, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      updated_at: new Date()
    };

    const tvShow = await tvShowRepository.update(id, updateData);

    if (!tvShow) {
      return res.status(404).json({
        success: false,
        message: 'TV show not found'
      });
    }

    return res.json({
      success: true,
      data: tvShow,
      message: 'TV show updated successfully'
    });
  } catch (error) {
    console.error('Error updating TV show:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating TV show',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/tvshows/{id}:
 *   delete:
 *     summary: Delete TV show
 *     tags: [TvShows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: TV show deleted successfully
 *       404:
 *         description: TV show not found
 */
router.delete('/:id', validateJWT, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const deleted = await tvShowRepository.delete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'TV show not found'
      });
    }

    return res.json({
      success: true,
      message: 'TV show deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting TV show:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting TV show',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/tvshows/{id}/like:
 *   post:
 *     summary: Like a TV show
 *     tags: [TvShows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: TV show liked successfully
 */
router.post('/:id/like', validateJWT, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await tvShowRepository.updateStatistics(id, 'like');

    return res.json({
      success: true,
      message: 'TV show liked successfully'
    });
  } catch (error) {
    console.error('Error liking TV show:', error);
    return res.status(500).json({
      success: false,
      message: 'Error liking TV show',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * @swagger
 * /api/tvshows/{id}/rate:
 *   post:
 *     summary: Rate a TV show
 *     tags: [TvShows]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: TV show rated successfully
 */
router.post('/:id/rate', validateJWT, async (req: Request, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    await tvShowRepository.updateStatistics(id, 'rating', rating);

    return res.json({
      success: true,
      message: 'TV show rated successfully'
    });
  } catch (error) {
    console.error('Error rating TV show:', error);
    return res.status(500).json({
      success: false,
      message: 'Error rating TV show',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 
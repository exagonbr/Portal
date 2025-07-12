import { Request, Response } from 'express';
import { QuestionService } from '../services/QuestionService';
import { CreateQuestionDto, UpdateQuestionDto, QuestionFilterDto } from '../dto/QuestionDto';

class QuestionController {
  private questionService: QuestionService;

  constructor() {
    const repository = new QuestionRepository();
    super(repository);
    this.questionRepository = repository;
    this.questionService = new QuestionService();
  }

  // GET /api/questions
  async getAll(req: Request, res: Response) {
    try {
      const filters: QuestionFilterDto = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        search: req.query.search as string,
        deleted: req.query.deleted === 'true' ? true : req.query.deleted === 'false' ? false : undefined,
        tvShowId: req.query.tvShowId ? parseInt(req.query.tvShowId as string) : undefined,
        episodeId: req.query.episodeId ? parseInt(req.query.episodeId as string) : undefined,
        fileId: req.query.fileId ? parseInt(req.query.fileId as string) : undefined
      };

      const result = await this.questionService.getAllQuestions(filters);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in QuestionController.getAll:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/questions/:id
  async getById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid question ID'
        });
      }

      const result = await this.questionService.getQuestionById(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in QuestionController.getById:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // POST /api/questions
  async create(req: Request, res: Response) {
    try {
      const questionData: CreateQuestionDto = req.body;

      const result = await this.questionService.createQuestion(questionData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(201).json(result);
    } catch (error) {
      console.error('Error in QuestionController.create:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // PUT /api/questions/:id
  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      const questionData: UpdateQuestionDto = req.body;

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid question ID'
        });
      }

      const result = await this.questionService.updateQuestion(id, questionData);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in QuestionController.update:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // DELETE /api/questions/:id
  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid question ID'
        });
      }

      const result = await this.questionService.deleteQuestion(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in QuestionController.delete:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // PATCH /api/questions/:id/soft-delete
  async softDelete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid question ID'
        });
      }

      const result = await this.questionService.softDeleteQuestion(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in QuestionController.softDelete:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // PATCH /api/questions/:id/restore
  async restore(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid question ID'
        });
      }

      const result = await this.questionService.restoreQuestion(id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in QuestionController.restore:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/questions/tv-show/:tvShowId
  async getByTvShow(req: Request, res: Response) {
    try {
      const tvShowId = parseInt(req.params.tvShowId);

      if (isNaN(tvShowId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid TV show ID'
        });
      }

      const result = await this.questionService.getQuestionsByTvShow(tvShowId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in QuestionController.getByTvShow:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/questions/episode/:episodeId
  async getByEpisode(req: Request, res: Response) {
    try {
      const episodeId = parseInt(req.params.episodeId);

      if (isNaN(episodeId)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid episode ID'
        });
      }

      const result = await this.questionService.getQuestionsByEpisode(episodeId);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in QuestionController.getByEpisode:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // GET /api/questions/stats
  async getStats(req: Request, res: Response) {
    try {
      const result = await this.questionService.getQuestionsStats();

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in QuestionController.getStats:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

export default QuestionController;

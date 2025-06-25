import { Request, Response } from 'express';
import { TvShowCompleteService } from '../services/TvShowCompleteService';

export class TvShowCompleteController {
  private tvShowService: TvShowCompleteService;

  constructor() {
    this.tvShowService = new TvShowCompleteService();
  }

  // ===================== TV SHOW CRUD =====================

  async getAllTvShows(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.tvShowService.getAllTvShows(page, limit);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erro no controller getAllTvShows:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async getTvShowById(req: Request, res: Response): Promise<Response> {
    try {
      const tvShowId = parseInt(req.params.id);
      
      if (isNaN(tvShowId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do TV Show inválido'
        });
      }

      const tvShow = await this.tvShowService.getTvShowById(tvShowId);
      
      // Buscar também os vídeos organizados por módulos
      const modules = await this.tvShowService.getVideosByTvShowGrouped(tvShowId);
      
      return res.json({
        success: true,
        data: {
          ...tvShow,
          modules
        }
      });
    } catch (error) {
      console.error('Erro no controller getTvShowById:', error);
      return res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : 'Erro interno do servidor'
      });
    }
  }

  async createTvShow(req: Request, res: Response): Promise<Response> {
    try {
      const tvShow = await this.tvShowService.createTvShow(req.body);

      return res.status(201).json({
        success: true,
        data: tvShow
      });
    } catch (error) {
      console.error('Erro no controller createTvShow:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async updateTvShow(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const tvShow = await this.tvShowService.updateTvShow(id, req.body);

      return res.json({
        success: true,
        data: tvShow
      });
    } catch (error) {
      console.error('Erro no controller updateTvShow:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async deleteTvShow(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      await this.tvShowService.deleteTvShow(id);

      return res.json({
        success: true,
        message: 'TV Show deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro no controller deleteTvShow:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async searchTvShows(req: Request, res: Response): Promise<Response> {
    try {
      const query = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Query de busca é obrigatória'
        });
      }

      const result = await this.tvShowService.searchTvShows(query, page, limit);

      return res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erro no controller searchTvShows:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // ===================== VIDEO CRUD =====================

  async getVideosByTvShow(req: Request, res: Response): Promise<Response> {
    try {
      const tvShowId = parseInt(req.params.tvShowId);
      
      if (isNaN(tvShowId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do TV Show inválido'
        });
      }

      const videos = await this.tvShowService.getVideosByTvShow(tvShowId);

      return res.json({
        success: true,
        data: videos
      });
    } catch (error) {
      console.error('Erro no controller getVideosByTvShow:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async getVideosByTvShowGrouped(req: Request, res: Response): Promise<Response> {
    try {
      const tvShowId = parseInt(req.params.tvShowId);
      
      if (isNaN(tvShowId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do TV Show inválido'
        });
      }

      const moduleGroups = await this.tvShowService.getVideosByTvShowGrouped(tvShowId);

      return res.json({
        success: true,
        data: moduleGroups
      });
    } catch (error) {
      console.error('Erro no controller getVideosByTvShowGrouped:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async getVideoById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const video = await this.tvShowService.getVideoById(id);

      return res.json({
        success: true,
        data: video
      });
    } catch (error) {
      console.error('Erro no controller getVideoById:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async createVideo(req: Request, res: Response): Promise<Response> {
    try {
      const video = await this.tvShowService.createVideo(req.body);

      return res.status(201).json({
        success: true,
        data: video
      });
    } catch (error) {
      console.error('Erro no controller createVideo:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async updateVideo(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const video = await this.tvShowService.updateVideo(id, req.body);

      return res.json({
        success: true,
        data: video
      });
    } catch (error) {
      console.error('Erro no controller updateVideo:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async deleteVideo(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      await this.tvShowService.deleteVideo(id);

      return res.json({
        success: true,
        message: 'Vídeo deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro no controller deleteVideo:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // ===================== QUESTION CRUD =====================

  async getQuestionsByTvShow(req: Request, res: Response): Promise<Response> {
    try {
      const tvShowId = parseInt(req.params.tvShowId);
      
      if (isNaN(tvShowId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do TV Show inválido'
        });
      }

      const questions = await this.tvShowService.getQuestionsByTvShow(tvShowId);

      return res.json({
        success: true,
        data: questions
      });
    } catch (error) {
      console.error('Erro no controller getQuestionsByTvShow:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async getQuestionById(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const question = await this.tvShowService.getQuestionById(id);

      return res.json({
        success: true,
        data: question
      });
    } catch (error) {
      console.error('Erro no controller getQuestionById:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async createQuestion(req: Request, res: Response): Promise<Response> {
    try {
      const question = await this.tvShowService.createQuestion(req.body);

      return res.status(201).json({
        success: true,
        data: question
      });
    } catch (error) {
      console.error('Erro no controller createQuestion:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async updateQuestion(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const question = await this.tvShowService.updateQuestion(id, req.body);

      return res.json({
        success: true,
        data: question
      });
    } catch (error) {
      console.error('Erro no controller updateQuestion:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async deleteQuestion(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      await this.tvShowService.deleteQuestion(id);

      return res.json({
        success: true,
        message: 'Questão deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro no controller deleteQuestion:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // ===================== ANSWER CRUD =====================

  async getAnswersByQuestion(req: Request, res: Response): Promise<Response> {
    try {
      const questionId = parseInt(req.params.questionId);
      
      if (isNaN(questionId)) {
        return res.status(400).json({
          success: false,
          message: 'ID da questão inválido'
        });
      }

      const answers = await this.tvShowService.getAnswersByQuestion(questionId);

      return res.json({
        success: true,
        data: answers
      });
    } catch (error) {
      console.error('Erro no controller getAnswersByQuestion:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async createAnswer(req: Request, res: Response): Promise<Response> {
    try {
      const answer = await this.tvShowService.createAnswer(req.body);

      return res.status(201).json({
        success: true,
        data: answer
      });
    } catch (error) {
      console.error('Erro no controller createAnswer:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async updateAnswer(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const answer = await this.tvShowService.updateAnswer(id, req.body);

      return res.json({
        success: true,
        data: answer
      });
    } catch (error) {
      console.error('Erro no controller updateAnswer:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async deleteAnswer(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      await this.tvShowService.deleteAnswer(id);

      return res.json({
        success: true,
        message: 'Resposta deletada com sucesso'
      });
    } catch (error) {
      console.error('Erro no controller deleteAnswer:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // ===================== FILE CRUD =====================

  async getFilesByTvShow(req: Request, res: Response): Promise<Response> {
    try {
      const tvShowId = parseInt(req.params.tvShowId);
      
      if (isNaN(tvShowId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do TV Show inválido'
        });
      }

      const files = await this.tvShowService.getFilesByTvShow(tvShowId);

      return res.json({
        success: true,
        data: files
      });
    } catch (error) {
      console.error('Erro no controller getFilesByTvShow:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async createFile(req: Request, res: Response): Promise<Response> {
    try {
      const file = await this.tvShowService.createFile(req.body);

      return res.status(201).json({
        success: true,
        data: file
      });
    } catch (error) {
      console.error('Erro no controller createFile:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async updateFile(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      const file = await this.tvShowService.updateFile(id, req.body);

      return res.json({
        success: true,
        data: file
      });
    } catch (error) {
      console.error('Erro no controller updateFile:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  async deleteFile(req: Request, res: Response): Promise<Response> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'ID inválido'
        });
      }

      await this.tvShowService.deleteFile(id);

      return res.json({
        success: true,
        message: 'Arquivo deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro no controller deleteFile:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  // ===================== UTILITY METHODS =====================

  async getTvShowStats(req: Request, res: Response): Promise<Response> {
    try {
      const tvShowId = parseInt(req.params.tvShowId);
      
      if (isNaN(tvShowId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do TV Show inválido'
        });
      }

      const stats = await this.tvShowService.getTvShowStats(tvShowId);

      return res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Erro no controller getTvShowStats:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
} 
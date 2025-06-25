import { Request, Response } from 'express';
import { TvShowCompleteService } from '../services/TvShowCompleteService';

export class TvShowCompleteController {
  private tvShowService: TvShowCompleteService;

  constructor() {
    this.tvShowService = new TvShowCompleteService();
  }

  // ===================== TV SHOW CRUD =====================

  getAllTvShows = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const search = req.query.search as string;

      let result;
      if (search) {
        result = await this.tvShowService.searchTvShows(search, page, limit);
      } else {
        result = await this.tvShowService.getAllTvShows(page, limit);
      }

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar coleções de TV',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  getTvShowById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const tvShow = await this.tvShowService.getTvShowById(id);

      res.json({
        success: true,
        data: tvShow
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: 'Coleção não encontrada',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  createTvShow = async (req: Request, res: Response) => {
    try {
      const tvShow = await this.tvShowService.createTvShow(req.body);

      res.status(201).json({
        success: true,
        message: 'Coleção criada com sucesso',
        data: tvShow
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao criar coleção',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  updateTvShow = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const tvShow = await this.tvShowService.updateTvShow(id, req.body);

      res.json({
        success: true,
        message: 'Coleção atualizada com sucesso',
        data: tvShow
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao atualizar coleção',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  deleteTvShow = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await this.tvShowService.deleteTvShow(id);

      res.json({
        success: true,
        message: 'Coleção removida com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao remover coleção',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  // ===================== VIDEO CRUD =====================

  getVideosByTvShow = async (req: Request, res: Response) => {
    try {
      const tvShowId = parseInt(req.params.tvShowId);
      const videos = await this.tvShowService.getVideosByTvShow(tvShowId);

      res.json({
        success: true,
        data: videos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar vídeos',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  getModulesStructure = async (req: Request, res: Response) => {
    try {
      const tvShowId = parseInt(req.params.tvShowId);
      const modules = await this.tvShowService.getModulesStructure(tvShowId);

      res.json({
        success: true,
        data: modules
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estrutura de módulos',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  getVideoById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const video = await this.tvShowService.getVideoById(id);

      res.json({
        success: true,
        data: video
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: 'Vídeo não encontrado',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  createVideo = async (req: Request, res: Response) => {
    try {
      const video = await this.tvShowService.createVideo(req.body);

      res.status(201).json({
        success: true,
        message: 'Vídeo criado com sucesso',
        data: video
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao criar vídeo',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  updateVideo = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const video = await this.tvShowService.updateVideo(id, req.body);

      res.json({
        success: true,
        message: 'Vídeo atualizado com sucesso',
        data: video
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao atualizar vídeo',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  deleteVideo = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await this.tvShowService.deleteVideo(id);

      res.json({
        success: true,
        message: 'Vídeo removido com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao remover vídeo',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  // ===================== QUESTION CRUD =====================

  getQuestionsByTvShow = async (req: Request, res: Response) => {
    try {
      const tvShowId = parseInt(req.params.tvShowId);
      const questions = await this.tvShowService.getQuestionsByTvShow(tvShowId);

      res.json({
        success: true,
        data: questions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar questões',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  getQuestionById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const question = await this.tvShowService.getQuestionById(id);

      res.json({
        success: true,
        data: question
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: 'Questão não encontrada',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  createQuestion = async (req: Request, res: Response) => {
    try {
      const question = await this.tvShowService.createQuestion(req.body);

      res.status(201).json({
        success: true,
        message: 'Questão criada com sucesso',
        data: question
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao criar questão',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  updateQuestion = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const question = await this.tvShowService.updateQuestion(id, req.body);

      res.json({
        success: true,
        message: 'Questão atualizada com sucesso',
        data: question
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao atualizar questão',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  deleteQuestion = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await this.tvShowService.deleteQuestion(id);

      res.json({
        success: true,
        message: 'Questão removida com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao remover questão',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  // ===================== ANSWER CRUD =====================

  createAnswer = async (req: Request, res: Response) => {
    try {
      const answer = await this.tvShowService.createAnswer(req.body);

      res.status(201).json({
        success: true,
        message: 'Resposta criada com sucesso',
        data: answer
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao criar resposta',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  updateAnswer = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const answer = await this.tvShowService.updateAnswer(id, req.body);

      res.json({
        success: true,
        message: 'Resposta atualizada com sucesso',
        data: answer
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao atualizar resposta',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  deleteAnswer = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await this.tvShowService.deleteAnswer(id);

      res.json({
        success: true,
        message: 'Resposta removida com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao remover resposta',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  // ===================== FILE CRUD =====================

  getFilesByTvShow = async (req: Request, res: Response) => {
    try {
      const tvShowId = parseInt(req.params.tvShowId);
      const files = await this.tvShowService.getFilesByTvShow(tvShowId);

      res.json({
        success: true,
        data: files
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar arquivos',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  createFile = async (req: Request, res: Response) => {
    try {
      const file = await this.tvShowService.createFile(req.body);

      res.status(201).json({
        success: true,
        message: 'Arquivo criado com sucesso',
        data: file
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao criar arquivo',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  deleteFile = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await this.tvShowService.deleteFile(id);

      res.json({
        success: true,
        message: 'Arquivo removido com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Erro ao remover arquivo',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };

  // ===================== UTILITY ENDPOINTS =====================

  getTvShowStats = async (req: Request, res: Response) => {
    try {
      const tvShowId = parseInt(req.params.tvShowId);
      const stats = await this.tvShowService.getTvShowStats(tvShowId);

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar estatísticas',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  };
} 
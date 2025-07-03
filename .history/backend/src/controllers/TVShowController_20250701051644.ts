import { Request, Response } from 'express';
import { TVShowService } from '../services/TVShowService';

export class TVShowController {
  /**
   * GET /api/collections
   * Busca todas as coleções
   */
  static async getAllCollections(req: Request, res: Response): Promise<void> {
    try {
      const collections = await TVShowService.getAllCollections();
      
      res.json({
        success: true,
        data: collections,
        message: 'Coleções recuperadas com sucesso'
      });
    } catch (error) {
      console.log('Erro ao buscar coleções:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar coleções',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/collections/:id
   * Busca uma coleção específica por ID
   */
  static async getCollectionById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        res.status(400).json({
          success: false,
          message: 'ID da coleção deve ser um número válido'
        });
        return;
      }

      const collection = await TVShowService.getCollectionById(id);
      
      if (!collection) {
        res.status(404).json({
          success: false,
          message: 'Coleção não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: collection,
        message: 'Coleção recuperada com sucesso'
      });
    } catch (error) {
      console.log('Erro ao buscar coleção:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar coleção',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/collections/search?q=termo
   * Pesquisa coleções por termo
   */
  static async searchCollections(req: Request, res: Response): Promise<void> {
    try {
      const searchTerm = req.query.q as string;
      
      if (!searchTerm || searchTerm.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Termo de pesquisa é obrigatório'
        });
        return;
      }

      const collections = await TVShowService.searchCollections(searchTerm.trim());
      
      res.json({
        success: true,
        data: collections,
        message: `${collections.length} coleções encontradas para "${searchTerm}"`
      });
    } catch (error) {
      console.log('Erro ao pesquisar coleções:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao pesquisar coleções',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/collections/popular?limit=10
   * Busca coleções populares
   */
  static async getPopularCollections(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (limit < 1 || limit > 50) {
        res.status(400).json({
          success: false,
          message: 'Limite deve ser entre 1 e 50'
        });
        return;
      }

      const collections = await TVShowService.getPopularCollections(limit);
      
      res.json({
        success: true,
        data: collections,
        message: 'Coleções populares recuperadas com sucesso'
      });
    } catch (error) {
      console.log('Erro ao buscar coleções populares:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar coleções populares',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/collections/top-rated?limit=10
   * Busca coleções mais bem avaliadas
   */
  static async getTopRatedCollections(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (limit < 1 || limit > 50) {
        res.status(400).json({
          success: false,
          message: 'Limite deve ser entre 1 e 50'
        });
        return;
      }

      const collections = await TVShowService.getTopRatedCollections(limit);
      
      res.json({
        success: true,
        data: collections,
        message: 'Coleções mais bem avaliadas recuperadas com sucesso'
      });
    } catch (error) {
      console.log('Erro ao buscar coleções mais bem avaliadas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar coleções mais bem avaliadas',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/collections/recent?limit=10
   * Busca coleções recentes
   */
  static async getRecentCollections(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (limit < 1 || limit > 50) {
        res.status(400).json({
          success: false,
          message: 'Limite deve ser entre 1 e 50'
        });
        return;
      }

      const collections = await TVShowService.getRecentCollections(limit);
      
      res.json({
        success: true,
        data: collections,
        message: 'Coleções recentes recuperadas com sucesso'
      });
    } catch (error) {
      console.log('Erro ao buscar coleções recentes:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar coleções recentes',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
} 
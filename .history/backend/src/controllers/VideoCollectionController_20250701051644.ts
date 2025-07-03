import { Request, Response } from 'express';
import { VideoCollectionService } from '../services/VideoCollectionService';
import { MigrationService } from '../services/MigrationService';

export class VideoCollectionController {
  private videoCollectionService: VideoCollectionService;
  private migrationService: MigrationService;

  constructor() {
    this.videoCollectionService = new VideoCollectionService();
    this.migrationService = new MigrationService();
  }

  /**
   * GET /api/collections/manage
   * Lista todas as coleções para gerenciamento
   */
  async getAllCollections(req: Request, res: Response): Promise<void> {
    try {
      const collections = await this.videoCollectionService.getAllCollectionsForManagement();
      
      res.json({
        success: true,
        data: { collections },
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
   * GET /api/collections/manage/:id
   * Busca uma coleção específica com seus vídeos
   */
  async getCollectionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const collection = await this.videoCollectionService.getCollectionWithVideos(id);
      
      if (!collection) {
        res.status(404).json({
          success: false,
          message: 'Coleção não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: { collection },
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
   * POST /api/collections/manage
   * Cria uma nova coleção
   */
  async createCollection(req: Request, res: Response): Promise<void> {
    try {
      const collectionData = req.body;
      
      // Validações básicas
      if (!collectionData.name || !collectionData.synopsis) {
        res.status(400).json({
          success: false,
          message: 'Nome e sinopse são obrigatórios'
        });
        return;
      }

      const collection = await this.videoCollectionService.createCollection(collectionData);
      
      res.status(201).json({
        success: true,
        data: { collection },
        message: 'Coleção criada com sucesso'
      });
    } catch (error) {
      console.log('Erro ao criar coleção:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao criar coleção',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * PUT /api/collections/manage/:id
   * Atualiza uma coleção existente
   */
  async updateCollection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const collectionData = req.body;
      
      const collection = await this.videoCollectionService.updateCollection(id, collectionData);
      
      if (!collection) {
        res.status(404).json({
          success: false,
          message: 'Coleção não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: { collection },
        message: 'Coleção atualizada com sucesso'
      });
    } catch (error) {
      console.log('Erro ao atualizar coleção:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao atualizar coleção',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * DELETE /api/collections/manage/:id
   * Remove uma coleção
   */
  async deleteCollection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const deleted = await this.videoCollectionService.deleteCollection(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Coleção não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Coleção removida com sucesso'
      });
    } catch (error) {
      console.log('Erro ao remover coleção:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao remover coleção',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * POST /api/collections/manage/videos
   * Cria um novo vídeo em uma coleção
   */
  async createVideo(req: Request, res: Response): Promise<void> {
    try {
      const videoData = req.body;
      
      // Validações básicas
      if (!videoData.collection_id || !videoData.title || !videoData.synopsis) {
        res.status(400).json({
          success: false,
          message: 'ID da coleção, título e sinopse são obrigatórios'
        });
        return;
      }

      // Se não informado, buscar próximo número de módulo/ordem
      if (!videoData.module_number) {
        videoData.module_number = await this.videoCollectionService.getNextModuleNumber(videoData.collection_id);
      }
      
      if (!videoData.order_in_module) {
        videoData.order_in_module = await this.videoCollectionService.getNextOrderInModule(
          videoData.collection_id, 
          videoData.module_number
        );
      }

      const video = await this.videoCollectionService.createVideo(videoData);
      
      res.status(201).json({
        success: true,
        data: { video },
        message: 'Vídeo criado com sucesso'
      });
    } catch (error) {
      console.log('Erro ao criar vídeo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao criar vídeo',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * PUT /api/collections/manage/videos/:id
   * Atualiza um vídeo existente
   */
  async updateVideo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const videoData = req.body;
      
      const video = await this.videoCollectionService.updateVideo(id, videoData);
      
      if (!video) {
        res.status(404).json({
          success: false,
          message: 'Vídeo não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: { video },
        message: 'Vídeo atualizado com sucesso'
      });
    } catch (error) {
      console.log('Erro ao atualizar vídeo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao atualizar vídeo',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * DELETE /api/collections/manage/videos/:id
   * Remove um vídeo
   */
  async deleteVideo(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const deleted = await this.videoCollectionService.deleteVideo(id);
      
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Vídeo não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Vídeo removido com sucesso'
      });
    } catch (error) {
      console.log('Erro ao remover vídeo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao remover vídeo',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/collections/public
   * API pública para visualização de coleções (compatível com a existente)
   */
  async getPublicCollections(req: Request, res: Response): Promise<void> {
    try {
      const collections = await this.videoCollectionService.getPublicCollections();
      
      res.json({
        success: true,
        data: collections,
        message: 'Coleções recuperadas com sucesso'
      });
    } catch (error) {
      console.log('Erro ao buscar coleções públicas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar coleções',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/collections/public/search?q=termo
   * Pesquisa coleções públicas
   */
  async searchPublicCollections(req: Request, res: Response): Promise<void> {
    try {
      const searchTerm = req.query.q as string;
      
      if (!searchTerm || searchTerm.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Termo de pesquisa é obrigatório'
        });
        return;
      }

      const collections = await this.videoCollectionService.searchCollections(searchTerm.trim());
      
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
   * GET /api/collections/public/popular?limit=10
   * Busca coleções populares
   */
  async getPopularCollections(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      
      if (limit < 1 || limit > 50) {
        res.status(400).json({
          success: false,
          message: 'Limite deve ser entre 1 e 50'
        });
        return;
      }

      const collections = await this.videoCollectionService.getPopularCollections(limit);
      
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
   * POST /api/collections/migrate
   * Executa migração do MySQL para PostgreSQL
   */
  async migrateFromMySQL(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.migrationService.migrateTVShowsToCollections();
      
      res.json({
        success: true,
        data: result,
        message: `Migração concluída: ${result.migrated} migrados, ${result.skipped} pulados`
      });
    } catch (error) {
      console.log('Erro na migração:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor durante a migração',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }

  /**
   * GET /api/collections/migration/stats
   * Estatísticas da migração
   */
  async getMigrationStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.migrationService.getMigrationStats();
      
      res.json({
        success: true,
        data: stats,
        message: 'Estatísticas de migração recuperadas com sucesso'
      });
    } catch (error) {
      console.log('Erro ao buscar estatísticas de migração:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao buscar estatísticas',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  }
} 
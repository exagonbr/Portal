import { Request, Response, NextFunction } from 'express';
import { VideoRepository } from '../repositories/VideoRepository';
import { CreateVideoData, UpdateVideoData } from '../entities/Video';

export class VideoController {
  static async getVideos(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit, offset, search, show_id, class: videoClass } = req.query;
      
      let videos;
      
      if (search) {
        videos = await VideoRepository.search(
          search as string, 
          limit ? parseInt(limit as string) : undefined
        );
      } else if (show_id) {
        videos = await VideoRepository.findByShow(parseInt(show_id as string));
      } else if (videoClass) {
        videos = await VideoRepository.findByClass(videoClass as string);
      } else {
        videos = await VideoRepository.findAll(
          limit ? parseInt(limit as string) : undefined,
          offset ? parseInt(offset as string) : undefined
        );
      }

      return res.json({
        success: true,
        data: videos,
        total: videos.length
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar vídeos',
        error: error.message
      });
    }
  }

  static async getVideoById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const videoId = parseInt(id);

      if (isNaN(videoId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do vídeo inválido'
        });
      }

      const video = await VideoRepository.findById(videoId);

      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Vídeo não encontrado'
        });
      }

      return res.json({
        success: true,
        data: video
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar vídeo',
        error: error.message
      });
    }
  }

  static async createVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const videoData: CreateVideoData = req.body;

      // Validação básica
      if (!videoData.class) {
        return res.status(400).json({
          success: false,
          message: 'Campo "class" é obrigatório'
        });
      }

      const video = await VideoRepository.create(videoData);

      return res.status(201).json({
        success: true,
        data: video,
        message: 'Vídeo criado com sucesso'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao criar vídeo',
        error: error.message
      });
    }
  }

  static async updateVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const videoId = parseInt(id);
      const videoData: UpdateVideoData = req.body;

      if (isNaN(videoId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do vídeo inválido'
        });
      }

      const video = await VideoRepository.update(videoId, videoData);

      if (!video) {
        return res.status(404).json({
          success: false,
          message: 'Vídeo não encontrado'
        });
      }

      return res.json({
        success: true,
        data: video,
        message: 'Vídeo atualizado com sucesso'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao atualizar vídeo',
        error: error.message
      });
    }
  }

  static async deleteVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const videoId = parseInt(id);

      if (isNaN(videoId)) {
        return res.status(400).json({
          success: false,
          message: 'ID do vídeo inválido'
        });
      }

      const deleted = await VideoRepository.delete(videoId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Vídeo não encontrado'
        });
      }

      return res.json({
        success: true,
        message: 'Vídeo deletado com sucesso'
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao deletar vídeo',
        error: error.message
      });
    }
  }

  static async getVideosByShow(req: Request, res: Response, next: NextFunction) {
    try {
      const { showId } = req.params;
      const showIdNum = parseInt(showId);

      if (isNaN(showIdNum)) {
        return res.status(400).json({
          success: false,
          message: 'ID do show inválido'
        });
      }

      const videos = await VideoRepository.findByShow(showIdNum);

      return res.json({
        success: true,
        data: videos,
        total: videos.length
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao buscar vídeos do show',
        error: error.message
      });
    }
  }

  static async searchVideos(req: Request, res: Response, next: NextFunction) {
    try {
      const { q, limit } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Parâmetro de busca "q" é obrigatório'
        });
      }

      const videos = await VideoRepository.search(
        q as string,
        limit ? parseInt(limit as string) : undefined
      );

      return res.json({
        success: true,
        data: videos,
        total: videos.length
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao pesquisar vídeos',
        error: error.message
      });
    }
  }

  static async getVideosCount(req: Request, res: Response, next: NextFunction) {
    try {
      const count = await VideoRepository.count();

      return res.json({
        success: true,
        data: { count }
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Erro ao contar vídeos',
        error: error.message
      });
    }
  }
} 
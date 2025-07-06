import { Request, Response } from 'express';
import { ViewingStatusService, UpdateViewingStatusDTO, ViewingInteractionDTO } from '../services/ViewingStatusService';
import { AppDataSource } from '../config/database';
import { getUserFromRequest } from '../utils/auth';

export class ViewingStatusController {
  private service: ViewingStatusService;

  constructor() {
    this.service = new ViewingStatusService(AppDataSource);
  }

  /**
   * Atualiza o status de visualização de um vídeo
   */
  async updateStatus(req: Request, res: Response): Promise<Response> {
    try {
      const user = await getUserFromRequest(req);
      
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const data: UpdateViewingStatusDTO = {
        userId: user.id,
        ...req.body
      };

      // Validação básica
      if (!data.videoId && !data.tvShowId && !(data.contentType && data.contentId)) {
        return res.status(400).json({ 
          error: 'É necessário informar videoId, tvShowId ou contentType+contentId' 
        });
      }

      if (data.currentPlayTime === undefined) {
        return res.status(400).json({ error: 'É necessário informar currentPlayTime' });
      }

      // Detectar informações do dispositivo a partir do cabeçalho User-Agent
      const userAgent = req.headers['user-agent'];
      if (userAgent && !data.deviceType) {
        if (userAgent.includes('Mobile')) {
          data.deviceType = 'mobile';
        } else if (userAgent.includes('Tablet')) {
          data.deviceType = 'tablet';
        } else {
          data.deviceType = 'web';
        }

        // Detectar navegador
        if (userAgent.includes('Chrome')) {
          data.browser = 'Chrome';
        } else if (userAgent.includes('Firefox')) {
          data.browser = 'Firefox';
        } else if (userAgent.includes('Safari')) {
          data.browser = 'Safari';
        } else if (userAgent.includes('Edge')) {
          data.browser = 'Edge';
        }

        // Detectar sistema operacional
        if (userAgent.includes('Windows')) {
          data.os = 'Windows';
        } else if (userAgent.includes('Mac')) {
          data.os = 'MacOS';
        } else if (userAgent.includes('Linux')) {
          data.os = 'Linux';
        } else if (userAgent.includes('Android')) {
          data.os = 'Android';
        } else if (userAgent.includes('iOS')) {
          data.os = 'iOS';
        }
      }

      // Obter IP do cliente
      data.ipAddress = req.ip || req.socket.remoteAddress || '';

      const result = await this.service.updateViewingStatus(data);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao atualizar status de visualização:', error);
      return res.status(500).json({ error: 'Erro ao atualizar status de visualização' });
    }
  }

  /**
   * Registra uma interação do usuário com o vídeo
   */
  async recordInteraction(req: Request, res: Response): Promise<Response> {
    try {
      const user = await getUserFromRequest(req);
      
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { videoId, action, timestamp, value } = req.body;

      if (!videoId || !action || timestamp === undefined) {
        return res.status(400).json({ 
          error: 'É necessário informar videoId, action e timestamp' 
        });
      }

      const interaction: ViewingInteractionDTO = {
        action,
        timestamp,
        value
      };

      await this.service.recordInteraction(user.id, videoId, interaction);
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Erro ao registrar interação:', error);
      return res.status(500).json({ error: 'Erro ao registrar interação' });
    }
  }

  /**
   * Inicia uma nova sessão de visualização
   */
  async startSession(req: Request, res: Response): Promise<Response> {
    try {
      const user = await getUserFromRequest(req);
      
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { videoId, tvShowId } = req.body;

      if (!videoId) {
        return res.status(400).json({ error: 'É necessário informar videoId' });
      }

      const result = await this.service.startWatchSession(user.id, videoId, tvShowId);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao iniciar sessão de visualização:', error);
      return res.status(500).json({ error: 'Erro ao iniciar sessão de visualização' });
    }
  }

  /**
   * Obtém o status de visualização de um vídeo para o usuário atual
   */
  async getStatus(req: Request, res: Response): Promise<Response> {
    try {
      const user = await getUserFromRequest(req);
      
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const videoId = parseInt(req.params.videoId);
      const tvShowId = req.query.tvShowId ? parseInt(req.query.tvShowId as string) : undefined;
      const contentType = req.query.contentType as string | undefined;
      const contentId = req.query.contentId ? parseInt(req.query.contentId as string) : undefined;

      if (!videoId && !tvShowId && !(contentType && contentId)) {
        return res.status(400).json({ 
          error: 'É necessário informar videoId, tvShowId ou contentType+contentId' 
        });
      }

      const result = await this.service.getViewingStatus(
        user.id,
        videoId,
        tvShowId,
        contentType,
        contentId
      );
      
      if (!result) {
        return res.status(404).json({ error: 'Status de visualização não encontrado' });
      }
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao obter status de visualização:', error);
      return res.status(500).json({ error: 'Erro ao obter status de visualização' });
    }
  }

  /**
   * Lista o histórico de visualização do usuário atual
   */
  async getHistory(req: Request, res: Response): Promise<Response> {
    try {
      const user = await getUserFromRequest(req);
      
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
      const completed = req.query.completed === 'true' ? true : 
                       req.query.completed === 'false' ? false : undefined;
      const contentType = req.query.contentType as string | undefined;

      const result = await this.service.getUserWatchHistory(user.id, {
        limit,
        offset,
        completed,
        contentType
      });
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao obter histórico de visualização:', error);
      return res.status(500).json({ error: 'Erro ao obter histórico de visualização' });
    }
  }

  /**
   * Obtém estatísticas de visualização do usuário atual
   */
  async getStats(req: Request, res: Response): Promise<Response> {
    try {
      const user = await getUserFromRequest(req);
      
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const result = await this.service.getUserViewingStats(user.id);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Erro ao obter estatísticas de visualização:', error);
      return res.status(500).json({ error: 'Erro ao obter estatísticas de visualização' });
    }
  }

  /**
   * Remove um registro de visualização
   */
  async removeStatus(req: Request, res: Response): Promise<Response> {
    try {
      const user = await getUserFromRequest(req);
      
      if (!user) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const videoId = parseInt(req.params.videoId);
      const tvShowId = req.query.tvShowId ? parseInt(req.query.tvShowId as string) : undefined;

      if (!videoId && !tvShowId) {
        return res.status(400).json({ error: 'É necessário informar videoId ou tvShowId' });
      }

      await this.service.removeViewingStatus(user.id, videoId, tvShowId);
      
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Erro ao remover status de visualização:', error);
      return res.status(500).json({ error: 'Erro ao remover status de visualização' });
    }
  }
} 
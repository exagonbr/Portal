import { Request, Response } from 'express';
import { ViewingStatusService, UpdateViewingStatusDTO, ViewingInteractionDTO } from '../services/ViewingStatusService';
import { AppDataSource } from '../config/typeorm';
import { getUserFromRequest } from '../utils/auth';
import { BaseController } from './BaseController';
import { ViewingStatus } from '../entities/ViewingStatus';
import { ViewingStatusRepository } from '../repositories/ViewingStatusRepository';
import db from '../config/database';

export class ViewingStatusController extends BaseController<ViewingStatus> {
  private viewingStatusRepository: ViewingStatusRepository;
  private service: ViewingStatusService;

  constructor() {
    const repository = new ViewingStatusRepository();
    super(repository);
    this.viewingStatusRepository = repository;
    this.service = new ViewingStatusService(AppDataSource, db);
  }

 // Métodos de resposta HTTP
 protected unauthorized(res: Response, message: string = 'Usuário não autenticado'): Response {
  return res.status(401).json({ success: false, error: message });
 }

 protected notFound(res: Response, message: string = 'Recurso não encontrado'): Response {
  return res.status(404).json({ success: false, error: message });
 }

 protected success(res: Response, data: any, status: number = 200): Response {
  return res.status(status).json({ success: true, data });
 }

 protected error(res: Response, error: any, status: number = 500): Response {
  console.error('Erro:', error);
  return res.status(status).json({ success: false, error: error.message || 'Erro interno do servidor' });
 }

 // Sobrescrevendo os métodos da classe base
 public async getAll(req: Request, res: Response): Promise<Response> {
  try {
   const user = await getUserFromRequest(req);
   
   if (!user) {
    return this.unauthorized(res, 'Usuário não autenticado');
   }

   const page = parseInt(req.query.page as string) || 1;
   const limit = parseInt(req.query.limit as string) || 10;

   const result = await this.service.getUserWatchHistory(
    Number(user.id),
    {
     limit,
     offset: (page - 1) * limit
    }
   );

   return this.success(res, {
    data: result.items,
    total: result.total,
    page,
    limit
   });
  } catch (error) {
   console.error(error);
   return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
 }

 public async getById(req: Request, res: Response): Promise<Response> {
  try {
   const { id } = req.params;
   const user = await getUserFromRequest(req);
   
   if (!user) {
    return this.unauthorized(res, 'Usuário não autenticado');
   }

   const result = await this.service.getViewingStatus(
    Number(user.id),
    parseInt(id)
   );

   if (!result) {
    return res.status(404).json({ success: false, message: 'Status de visualização não encontrado' });
   }

   return res.status(200).json({ success: true, data: result });
  } catch (error) {
   console.error(error);
   return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
 }

 public async create(req: Request, res: Response): Promise<Response> {
  try {
   const user = await getUserFromRequest(req);
   
   if (!user) {
    return this.unauthorized(res, 'Usuário não autenticado');
   }

   const data: UpdateViewingStatusDTO = {
    userId: Number(user.id),
    ...req.body
   };

   const result = await this.service.updateViewingStatus(data);
   return res.status(201).json({ success: true, data: result });
  } catch (error) {
   console.error(error);
   return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
 }

 public async update(req: Request, res: Response): Promise<Response> {
  try {
   const { id } = req.params;
   const user = await getUserFromRequest(req);
   
   if (!user) {
    return this.unauthorized(res, 'Usuário não autenticado');
   }

   const data: UpdateViewingStatusDTO = {
    userId: Number(user.id),
    videoId: parseInt(id),
    ...req.body
   };

   const result = await this.service.updateViewingStatus(data);
   return res.status(200).json({ success: true, data: result });
  } catch (error) {
   console.error(error);
   return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
 }

 public async delete(req: Request, res: Response): Promise<Response> {
  try {
   const { id } = req.params;
   const user = await getUserFromRequest(req);
   
   if (!user) {
    return this.unauthorized(res, 'Usuário não autenticado');
   }

   // Implementar lógica de remoção se necessário
   await this.service.removeViewingStatus(Number(user.id), parseInt(id));
   return res.status(200).json({ success: true, data: { message: 'Status de visualização removido com sucesso' } });
  } catch (error) {
   console.error(error);
   return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
 }

 /**
  * Atualiza o status de visualização de um vídeo
  */
 async updateStatus(req: Request, res: Response): Promise<Response> {
  try {
   const user = await getUserFromRequest(req);
   
   if (!user) {
    return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
   }

   const data: UpdateViewingStatusDTO = {
    userId: Number(user.id),
    ...req.body
   };

   // Validação básica
   if (!data.videoId && !data.tvShowId && !(data.contentType && data.contentId)) {
    return res.status(400).json({ 
     success: false,
     error: 'É necessário informar videoId, tvShowId ou contentType+contentId' 
    });
   }

   if (data.currentPlayTime === undefined) {
    return res.status(400).json({ success: false, error: 'É necessário informar currentPlayTime' });
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
   
   return res.status(200).json({ success: true, data: result });
  } catch (error) {
   console.error('Erro ao atualizar status de visualização:', error);
   return res.status(500).json({ success: false, error: 'Erro ao atualizar status de visualização' });
  }
 }

 /**
  * Registra uma interação do usuário com o vídeo
  */
 async recordInteraction(req: Request, res: Response): Promise<Response> {
  try {
   const user = await getUserFromRequest(req);
   
   if (!user) {
    return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
   }

   const { videoId, action, timestamp, value } = req.body;

   if (!videoId || !action || timestamp === undefined) {
    return res.status(400).json({ 
     success: false,
     error: 'É necessário informar videoId, action e timestamp' 
    });
   }

   const interaction: ViewingInteractionDTO = {
    action,
    timestamp,
    value
   };

   await this.service.recordInteraction(Number(user.id), videoId, interaction);
   
   return res.status(200).json({ success: true });
  } catch (error) {
   console.error('Erro ao registrar interação:', error);
   return res.status(500).json({ success: false, error: 'Erro ao registrar interação' });
  }
 }

 /**
  * Inicia uma nova sessão de visualização
  */
 async startSession(req: Request, res: Response): Promise<Response> {
  try {
   const user = await getUserFromRequest(req);
   
   if (!user) {
    return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
   }

   const { videoId, tvShowId } = req.body;

   if (!videoId) {
    return res.status(400).json({ success: false, error: 'É necessário informar videoId' });
   }

   const result = await this.service.startWatchSession(Number(user.id), videoId, tvShowId);
   
   return res.status(200).json({ success: true, data: result });
  } catch (error) {
   console.error('Erro ao iniciar sessão de visualização:', error);
   return res.status(500).json({ success: false, error: 'Erro ao iniciar sessão de visualização' });
  }
 }

 /**
  * Obtém o status de visualização de um vídeo para o usuário atual
  */
 async getStatus(req: Request, res: Response): Promise<Response> {
  try {
   const user = await getUserFromRequest(req);
   
   if (!user) {
    return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
   }

   const videoId = parseInt(req.params.videoId);
   const tvShowId = req.query.tvShowId ? parseInt(req.query.tvShowId as string) : undefined;
   const contentType = req.query.contentType as string | undefined;
   const contentId = req.query.contentId ? parseInt(req.query.contentId as string) : undefined;

   if (!videoId && !tvShowId && !(contentType && contentId)) {
    return res.status(400).json({ 
     success: false,
     error: 'É necessário informar videoId, tvShowId ou contentType+contentId' 
    });
   }

   const result = await this.service.getViewingStatus(
    Number(user.id),
    videoId,
    tvShowId,
    contentType,
    contentId
   );
   
   if (!result) {
    return res.status(404).json({ success: false, error: 'Status de visualização não encontrado' });
   }
   
   return res.status(200).json({ success: true, data: result });
  } catch (error) {
   console.error('Erro ao obter status de visualização:', error);
   return res.status(500).json({ success: false, error: 'Erro ao obter status de visualização' });
  }
 }

 /**
  * Lista o histórico de visualização do usuário atual
  */
 async getHistory(req: Request, res: Response): Promise<Response> {
  try {
   const user = await getUserFromRequest(req);
   
   if (!user) {
    return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
   }

   const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
   const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;

   const result = await this.service.getUserWatchHistory(
    Number(user.id),
    {
     limit,
     offset
    }
   );
   
   return res.status(200).json({ success: true, data: result });
  } catch (error) {
   console.error('Erro ao obter histórico de visualização:', error);
   return res.status(500).json({ success: false, error: 'Erro ao obter histórico de visualização' });
  }
 }

 /**
  * Obtém estatísticas de visualização do usuário atual
  */
 async getStats(req: Request, res: Response): Promise<Response> {
  try {
   const user = await getUserFromRequest(req);
   
   if (!user) {
    return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
   }

   const result = await this.service.getUserViewingStats(Number(user.id));
   
   return res.status(200).json({ success: true, data: result });
  } catch (error) {
   console.error('Erro ao obter estatísticas de visualização:', error);
   return res.status(500).json({ success: false, error: 'Erro ao obter estatísticas de visualização' });
  }
 }

 /**
  * Remove o status de visualização de um vídeo
  */
 async removeStatus(req: Request, res: Response): Promise<Response> {
  try {
   const user = await getUserFromRequest(req);
   
   if (!user) {
    return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
   }

   const videoId = parseInt(req.params.videoId);
   const tvShowId = req.query.tvShowId ? parseInt(req.query.tvShowId as string) : undefined;

   if (!videoId) {
    return res.status(400).json({ success: false, error: 'É necessário informar videoId' });
   }

   await this.service.removeViewingStatus(Number(user.id), videoId, tvShowId);
   
   return res.status(200).json({ success: true });
  } catch (error) {
   console.error('Erro ao remover status de visualização:', error);
   return res.status(500).json({ success: false, error: 'Erro ao remover status de visualização' });
  }
 }
} 

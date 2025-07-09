import { Repository, DataSource } from 'typeorm';
import { Knex } from 'knex';
import { ViewingStatus } from '../entities/ViewingStatus';
import { AppDataSource } from '../config/typeorm';
import { User } from '../entities/User';
import { Video } from '../entities/Video';
import { TvShow } from '../entities/TvShow';
import db from '../config/database';

export interface UpdateViewingStatusDTO {
  userId: number;
  videoId?: number;
  tvShowId?: number;
  contentId?: number;
  contentType?: string;
  currentPlayTime: number;
  totalDuration?: number;
  quality?: string;
  playbackSpeed?: number;
  subtitleLanguage?: string;
  audioLanguage?: string;
  deviceType?: string;
  deviceId?: string;
  browser?: string;
  os?: string;
  ipAddress?: string;
  classId?: number;
  institutionId?: number;
  courseId?: number;
  moduleId?: number;
  lessonId?: number;
}

export interface ViewingInteractionDTO {
  action: 'play' | 'pause' | 'seek' | 'replay' | 'quality_change' | 'speed_change';
  timestamp: number;
  value?: any;
}

export class ViewingStatusService {
  private repository: Repository<ViewingStatus>;
  private knexDb: Knex;

  constructor(dataSource: DataSource = AppDataSource, knexDb: Knex = db) {
    this.repository = dataSource.getRepository(ViewingStatus);
    this.knexDb = knexDb;
  }

  /**
   * Atualiza o status de visualização de um conteúdo
   */
  async updateViewingStatus(data: UpdateViewingStatusDTO): Promise<ViewingStatus> {
    try {
      // Buscar registro existente
      let viewingStatus = await this.findExistingStatus(data);

      if (!viewingStatus) {
        // Criar novo registro
        viewingStatus = this.repository.create({
          userId: data.userId,
          videoId: data.videoId,
          tvShowId: data.tvShowId,
          contentId: data.contentId,
          contentType: data.contentType,
          currentPlayTime: data.currentPlayTime,
          totalDuration: data.totalDuration,
          startedAt: new Date(),
          lastWatchedAt: new Date(),
          watchSessionsCount: 1,
          totalWatchTime: 0,
          quality: data.quality,
          playbackSpeed: data.playbackSpeed || 1.0,
          subtitleLanguage: data.subtitleLanguage,
          audioLanguage: data.audioLanguage,
          deviceType: data.deviceType || 'web',
          deviceId: data.deviceId,
          browser: data.browser,
          os: data.os,
          ipAddress: data.ipAddress,
          classId: data.classId,
          institutionId: data.institutionId,
          courseId: data.courseId,
          moduleId: data.moduleId,
          lessonId: data.lessonId,
          // Campos legados
          version: 1
        });
      } else {
        // Atualizar registro existente
        const sessionDuration = Math.max(0, data.currentPlayTime - (viewingStatus.currentPlayTime || 0));
        
        viewingStatus.currentPlayTime = data.currentPlayTime;
        viewingStatus.totalWatchTime = (viewingStatus.totalWatchTime || 0) + sessionDuration;
        
        if (data.totalDuration) {
          viewingStatus.totalDuration = data.totalDuration;
        }
        
        // Atualizar configurações se fornecidas
        if (data.quality) viewingStatus.quality = data.quality;
        if (data.playbackSpeed) viewingStatus.playbackSpeed = data.playbackSpeed;
        if (data.subtitleLanguage) viewingStatus.subtitleLanguage = data.subtitleLanguage;
        if (data.audioLanguage) viewingStatus.audioLanguage = data.audioLanguage;
        
        // Atualizar informações do dispositivo
        if (data.deviceType) viewingStatus.deviceType = data.deviceType;
        if (data.deviceId) viewingStatus.deviceId = data.deviceId;
        if (data.browser) viewingStatus.browser = data.browser;
        if (data.os) viewingStatus.os = data.os;
        if (data.ipAddress) viewingStatus.ipAddress = data.ipAddress;
        
        // Atualizar contexto educacional
        if (data.classId) viewingStatus.classId = data.classId;
        if (data.institutionId) viewingStatus.institutionId = data.institutionId;
        if (data.courseId) viewingStatus.courseId = data.courseId;
        if (data.moduleId) viewingStatus.moduleId = data.moduleId;
        if (data.lessonId) viewingStatus.lessonId = data.lessonId;
        
        // Atualizar campos legados
        viewingStatus.lastWatchedAt = new Date();
      }

      // Salvar no banco
      return await this.repository.save(viewingStatus);
    } catch (error) {
      console.error('Erro ao atualizar status de visualização:', error);
      throw error;
    }
  }

  /**
   * Registra uma interação do usuário com o vídeo
   */
  async recordInteraction(
    userId: number,
    videoId: number,
    interaction: ViewingInteractionDTO
  ): Promise<void> {
    try {
      const viewingStatus = await this.findExistingStatus({ userId, videoId });
      
      if (!viewingStatus) {
        throw new Error('Status de visualização não encontrado');
      }

      // Atualizar contadores baseado na ação
      switch (interaction.action) {
        case 'pause':
          viewingStatus.pausesCount = (viewingStatus.pausesCount || 0) + 1;
          break;
        case 'seek':
          viewingStatus.seeksCount = (viewingStatus.seeksCount || 0) + 1;
          break;
        case 'replay':
          viewingStatus.replayCount = (viewingStatus.replayCount || 0) + 1;
          break;
      }

      // Adicionar ao histórico de interações
      const interactionData = viewingStatus.interactionData || { history: [] };
      interactionData.history.push({
        action: interaction.action,
        timestamp: interaction.timestamp,
        value: interaction.value,
        recordedAt: new Date()
      });

      // Manter apenas as últimas 100 interações
      if (interactionData.history.length > 100) {
        interactionData.history = interactionData.history.slice(-100);
      }

      viewingStatus.interactionData = interactionData;
      
      await this.repository.save(viewingStatus);
    } catch (error) {
      console.error('Erro ao registrar interação:', error);
      throw error;
    }
  }

  /**
   * Inicia uma nova sessão de visualização
   */
  async startWatchSession(
    userId: number,
    videoId: number,
    tvShowId?: number
  ): Promise<ViewingStatus> {
    try {
      const viewingStatus = await this.findExistingStatus({ userId, videoId, tvShowId });
      
      if (viewingStatus) {
        viewingStatus.watchSessionsCount = (viewingStatus.watchSessionsCount || 0) + 1;
        if (!viewingStatus.startedAt) {
          viewingStatus.startedAt = new Date();
        }
        viewingStatus.lastWatchedAt = new Date();
        return await this.repository.save(viewingStatus);
      }

      // Se não existe, será criado no próximo update
      return this.repository.create({
        userId,
        videoId,
        tvShowId,
        startedAt: new Date(),
        lastWatchedAt: new Date(),
        watchSessionsCount: 1,
        currentPlayTime: 0,
        version: 1
      });
    } catch (error) {
      console.error('Erro ao iniciar sessão de visualização:', error);
      throw error;
    }
  }

  /**
   * Busca o status de visualização de um usuário para um conteúdo
   */
  async getViewingStatus(
    userId: number,
    videoId?: number,
    tvShowId?: number,
    contentType?: string,
    contentId?: number
  ): Promise<ViewingStatus | null> {
    try {
      return await this.findExistingStatus({
        userId,
        videoId,
        tvShowId,
        contentType,
        contentId
      });
    } catch (error) {
      console.error('Erro ao buscar status de visualização:', error);
      throw error;
    }
  }

  /**
   * Lista todos os conteúdos assistidos por um usuário
   */
  async getUserWatchHistory(
    userId: number,
    options?: {
      limit?: number;
      offset?: number;
      completed?: boolean;
      contentType?: string;
    }
  ): Promise<{ items: ViewingStatus[]; total: number }> {
    try {
      const limit = options?.limit || 10;
      const offset = options?.offset || 0;
      
      let query = this.repository.createQueryBuilder('vs')
        .where('vs.userId = :userId', { userId })
        .andWhere('vs.deleted = false')
        .orderBy('vs.lastWatchedAt', 'DESC');
      
      if (options?.completed !== undefined) {
        query = query.andWhere('vs.completed = :completed', { completed: options.completed });
      }
      
      if (options?.contentType) {
        query = query.andWhere('vs.contentType = :contentType', { contentType: options.contentType });
      }
      
      const [items, total] = await query
        .take(limit)
        .skip(offset)
        .getManyAndCount();
      
      return { items, total };
    } catch (error) {
      console.error('Erro ao buscar histórico de visualização:', error);
      throw error;
    }
  }

  /**
   * Obtém estatísticas de visualização do usuário
   */
  async getUserViewingStats(userId: number): Promise<{
    totalWatchTime: number;
    completedVideos: number;
    inProgressVideos: number;
    totalVideos: number;
    averageCompletion: number;
    mostWatchedContent: any[];
  }> {
    try {
      // Total de tempo assistido
      const totalWatchTimeResult = await this.repository
        .createQueryBuilder('vs')
        .select('SUM(vs.totalWatchTime)', 'totalWatchTime')
        .where('vs.userId = :userId', { userId })
        .andWhere('vs.deleted = false')
        .getRawOne();
      
      // Contagem de vídeos completos
      const completedVideosResult = await this.repository
        .createQueryBuilder('vs')
        .select('COUNT(*)', 'count')
        .where('vs.userId = :userId', { userId })
        .andWhere('vs.completed = true')
        .andWhere('vs.deleted = false')
        .getRawOne();
      
      // Contagem de vídeos em progresso
      const inProgressVideosResult = await this.repository
        .createQueryBuilder('vs')
        .select('COUNT(*)', 'count')
        .where('vs.userId = :userId', { userId })
        .andWhere('vs.completed = false')
        .andWhere('vs.currentPlayTime > 0')
        .andWhere('vs.deleted = false')
        .getRawOne();
      
      // Contagem total de vídeos
      const totalVideosResult = await this.repository
        .createQueryBuilder('vs')
        .select('COUNT(*)', 'count')
        .where('vs.userId = :userId', { userId })
        .andWhere('vs.deleted = false')
        .getRawOne();
      
      // Média de conclusão
      const averageCompletionResult = await this.repository
        .createQueryBuilder('vs')
        .select('AVG(vs.completionPercentage)', 'averageCompletion')
        .where('vs.userId = :userId', { userId })
        .andWhere('vs.deleted = false')
        .getRawOne();
      
      // Conteúdos mais assistidos
      const mostWatchedContent = await this.repository
        .createQueryBuilder('vs')
        .select([
          'vs.videoId',
          'vs.tvShowId',
          'vs.contentType',
          'vs.contentId',
          'vs.totalWatchTime',
          'vs.watchSessionsCount',
          'vs.completionPercentage'
        ])
        .where('vs.userId = :userId', { userId })
        .andWhere('vs.deleted = false')
        .orderBy('vs.totalWatchTime', 'DESC')
        .limit(5)
        .getRawMany();
      
      return {
        totalWatchTime: parseInt(totalWatchTimeResult?.totalWatchTime || '0'),
        completedVideos: parseInt(completedVideosResult?.count || '0'),
        inProgressVideos: parseInt(inProgressVideosResult?.count || '0'),
        totalVideos: parseInt(totalVideosResult?.count || '0'),
        averageCompletion: parseFloat(averageCompletionResult?.averageCompletion || '0'),
        mostWatchedContent
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de visualização:', error);
      throw error;
    }
  }

  /**
   * Método auxiliar para buscar um registro existente
   */
  private async findExistingStatus(data: {
    userId: number;
    videoId?: number;
    tvShowId?: number;
    contentType?: string;
    contentId?: number;
  }): Promise<ViewingStatus | null> {
    let query = this.repository.createQueryBuilder('vs')
      .where('vs.userId = :userId', { userId: data.userId })
      .andWhere('vs.deleted = false');
    
    if (data.videoId && data.tvShowId) {
      query = query
        .andWhere('vs.videoId = :videoId', { videoId: data.videoId })
        .andWhere('vs.tvShowId = :tvShowId', { tvShowId: data.tvShowId });
    } else if (data.videoId) {
      query = query
        .andWhere('vs.videoId = :videoId', { videoId: data.videoId })
        .andWhere('vs.tvShowId IS NULL');
    } else if (data.contentType && data.contentId) {
      query = query
        .andWhere('vs.contentType = :contentType', { contentType: data.contentType })
        .andWhere('vs.contentId = :contentId', { contentId: data.contentId });
    } else if (data.tvShowId) {
      query = query
        .andWhere('vs.tvShowId = :tvShowId', { tvShowId: data.tvShowId });
    }
    
    return await query.getOne();
  }

  /**
   * Remove um registro de visualização
   */
  async removeViewingStatus(
    userId: number,
    videoId?: number,
    tvShowId?: number
  ): Promise<void> {
    try {
      const viewingStatus = await this.findExistingStatus({ userId, videoId, tvShowId });
      
      if (viewingStatus) {
        // Soft delete
        viewingStatus.deleted = true;
        await this.repository.save(viewingStatus);
      }
    } catch (error) {
      console.error('Erro ao remover status de visualização:', error);
      throw error;
    }
  }
} 
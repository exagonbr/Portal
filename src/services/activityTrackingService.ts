import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

export interface ActivityTrack {
  userId: string;
  contentId: string;
  contentType: 'video' | 'book' | 'course' | 'tvshow';
  action: 'view' | 'complete' | 'pause' | 'resume';
  progress?: number;
  duration?: number;
  timestamp: Date;
}

export interface ViewingStatus {
  contentId: string;
  userId: string;
  progress: number;
  lastViewedAt: Date;
  completed: boolean;
  totalDuration?: number;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  contentId: string;
  contentType: string;
  addedAt: Date;
}

export interface SystemLog {
  id: string | number;
  user_id: string;
  user_name?: string;
  user_email?: string;
  activity_type: string;
  entity_type?: string;
  entity_id?: string;
  action: string;
  details?: Record<string, any>;
  ip_address?: string;
  ip?: string;
  user_agent?: string;
  device_info?: string;
  browser?: string;
  operating_system?: string;
  location?: string;
  duration_seconds?: number;
  start_time?: string;
  end_time?: string;
  session_id?: string;
  created_at: string;
  updated_at: string;
  timestamp?: string;
  severity?: string;
  user?: string;
}

export interface SystemLogParams {
  page?: number;
  limit?: number;
  activityType?: string;
  severity?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SystemLogStats {
  totalActivities: number;
  uniqueUsers: number;
  uniqueSessions: number;
  errorCount: number;
  warningCount: number;
  logSize: string;
}

export interface SystemLogsResponse {
  logs: SystemLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CleanupLogsParams {
  daysToKeep: number;
}

export interface CleanupLogsResponse {
  deletedCount: number;
  success: boolean;
}

class ActivityTrackingServiceClass {
  async trackActivity(activity: ActivityTrack): Promise<void> {
    try {
      await apiPost('/activity/track', activity);
    } catch (error) {
      console.error('Erro ao rastrear atividade:', error);
      // Não lançar erro para não interromper a experiência do usuário
    }
  }

  async getViewingStatus(contentId: string, userId: string): Promise<ViewingStatus | null> {
    try {
      const response = await apiGet<ViewingStatus>(`/activity/viewing-status/${contentId}/${userId}`);
      return response;
    } catch (error) {
      console.error('Erro ao buscar status de visualização:', error);
      return null;
    }
  }

  async updateViewingStatus(status: Partial<ViewingStatus> & { contentId: string; userId: string }): Promise<void> {
    try {
      await apiPut(`/activity/viewing-status/${status.contentId}/${status.userId}`, status);
    } catch (error) {
      console.error('Erro ao atualizar status de visualização:', error);
    }
  }

  async addToWatchlist(item: Omit<WatchlistItem, 'id' | 'addedAt'>): Promise<WatchlistItem> {
    try {
      const response = await apiPost<WatchlistItem>('/activity/watchlist', item);
      return response;
    } catch (error) {
      console.error('Erro ao adicionar à lista de assistir:', error);
      throw error;
    }
  }

  async removeFromWatchlist(itemId: string): Promise<void> {
    try {
      await apiDelete(`/activity/watchlist/${itemId}`);
    } catch (error) {
      console.error('Erro ao remover da lista de assistir:', error);
      throw error;
    }
  }

  async getWatchlist(userId: string): Promise<WatchlistItem[]> {
    try {
      const response = await apiGet<WatchlistItem[]>(`/activity/watchlist/user/${userId}`);
      return response || [];
    } catch (error) {
      console.error('Erro ao buscar lista de assistir:', error);
      return [];
    }
  }

  async isInWatchlist(contentId: string, userId: string): Promise<boolean> {
    try {
      const response = await apiGet<{ inWatchlist: boolean }>(`/activity/watchlist/check/${contentId}/${userId}`);
      return response.inWatchlist;
    } catch (error) {
      console.error('Erro ao verificar lista de assistir:', error);
      return false;
    }
  }

  async getUserActivity(userId: string, limit?: number): Promise<ActivityTrack[]> {
    try {
      const params = limit ? { limit } : {};
      const response = await apiGet<ActivityTrack[]>(`/activity/user/${userId}`, params);
      return response || [];
    } catch (error) {
      console.error('Erro ao buscar atividades do usuário:', error);
      return [];
    }
  }

  async getContentActivity(contentId: string, contentType: string): Promise<ActivityTrack[]> {
    try {
      const response = await apiGet<ActivityTrack[]>(`/activity/content/${contentType}/${contentId}`);
      return response || [];
    } catch (error) {
      console.error('Erro ao buscar atividades do conteúdo:', error);
      return [];
    }
  }

  // Novos métodos para gerenciamento de logs do sistema
  async getSystemLogs(params: SystemLogParams): Promise<SystemLogsResponse> {
    try {
      // Converter parâmetros para formato de query string
      const queryParams: Record<string, string> = {};
      if (params.page) queryParams.page = params.page.toString();
      if (params.limit) queryParams.limit = params.limit.toString();
      if (params.activityType) queryParams.activity_type = params.activityType;
      if (params.severity) queryParams.severity = params.severity;
      if (params.search) queryParams.search = params.search;
      if (params.startDate) queryParams.start_date = params.startDate;
      if (params.endDate) queryParams.end_date = params.endDate;
      if (params.sortOrder) queryParams.sort_order = params.sortOrder;

      const response = await apiGet<SystemLogsResponse>('/admin/audit', queryParams);
      return response;
    } catch (error) {
      console.error('Erro ao buscar logs do sistema:', error);
      throw error;
    }
  }

  async getSystemLogStats(params?: { startDate?: string; endDate?: string }): Promise<SystemLogStats> {
    try {
      const response = await apiPost<SystemLogStats>('/admin/audit', params || {});
      return response;
    } catch (error) {
      console.error('Erro ao buscar estatísticas dos logs:', error);
      throw error;
    }
  }

  async exportSystemLogs(params: SystemLogParams & { format: string }): Promise<void> {
    try {
      // Converter parâmetros para formato de query string
      const queryParams: Record<string, string> = {};
      if (params.activityType) queryParams.activity_type = params.activityType;
      if (params.severity) queryParams.severity = params.severity;
      if (params.search) queryParams.search = params.search;
      if (params.startDate) queryParams.start_date = params.startDate;
      if (params.endDate) queryParams.end_date = params.endDate;
      if (params.format) queryParams.format = params.format;

      // Construir URL para download
      const queryString = new URLSearchParams(queryParams).toString();
      window.location.href = `/api/admin/audit/export?${queryString}`;
    } catch (error) {
      console.error('Erro ao exportar logs do sistema:', error);
      throw error;
    }
  }

  async cleanupSystemLogs(params: CleanupLogsParams): Promise<CleanupLogsResponse> {
    try {
      const response = await apiPost<CleanupLogsResponse>('/admin/audit/cleanup', params);
      return response;
    } catch (error) {
      console.error('Erro ao limpar logs antigos:', error);
      throw error;
    }
  }
}

export const activityTrackingService = new ActivityTrackingServiceClass();
export const activityTracker = activityTrackingService; // Alias para compatibilidade 
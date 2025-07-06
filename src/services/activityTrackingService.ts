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
}

export const activityTrackingService = new ActivityTrackingServiceClass();
export const activityTracker = activityTrackingService; // Alias para compatibilidade 
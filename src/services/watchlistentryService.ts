import { apiClient } from '@/lib/api-client';
import { BaseApiService } from './base-api-service';

export interface WatchlistEntry {
  id: string;
  userId: string;
  videoId: string;
  addedAt: string;
  watched: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  video?: {
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    duration?: number;
  };
}

export interface CreateWatchlistEntryDto {
  userId: string;
  videoId: string;
}

export interface UpdateWatchlistEntryDto {
  watched?: boolean;
}

export interface WatchlistEntryResponse {
  data: WatchlistEntry[];
  total: number;
}

class WatchlistEntryService extends BaseApiService<WatchlistEntry> {
  constructor() {
    super('/api/watchlist-entry');
  }

  async getAllWithPagination(page: number = 1, limit: number = 10): Promise<WatchlistEntryResponse> {
    const response = await apiClient.post<any>(`${this.basePath}?page=${page}&limit=${limit}`, { videoId });
    return response.data;
  }

  async removeFromWatchlist(videoId: string): Promise<{ success: boolean }> {
    const response = await apiClient.put<any>(`${this.basePath}/remove/${videoId}`);
    return response.data;
  }

  async markAsUnwatched(id: string): Promise<WatchlistEntry> {
    const response = await apiClient.put<any>(`${this.basePath}/${id}/unwatched`);
    return response.data;
  }

  async getWatchedVideos(userId?: string): Promise<WatchlistEntry[]> {
    let url = `${this.basePath}/watched`;
    if (userId) {
      url += `?userId=${userId}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar vídeos assistidos');
    }

    return response.json();
  }

  async getUnwatchedVideos(userId?: string): Promise<WatchlistEntry[]> {
    let url = `${this.basePath}/unwatched`;
    if (userId) {
      url += `?userId=${userId}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar vídeos não assistidos');
    }

    return response.json();
  }

  async clearWatchlist(userId?: string): Promise<{ deleted: number }> {
    let url = `${this.basePath}/clear`;
    if (userId) {
      url += `?userId=${userId}`;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao limpar lista de observação');
    }

    return response.json();
  }

  async isInWatchlist(videoId: string): Promise<boolean> {
    const response = await fetch(`${this.basePath}/check/${videoId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao verificar se está na lista');
    }

    const result = await response.json();
    return result.inWatchlist;
  }
}

export const watchlistEntryService = new WatchlistEntryService();
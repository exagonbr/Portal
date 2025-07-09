import { BaseApiService } from './base-api-service';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

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
    super('/api/watchlist');
  }

  async getAllWithPagination(page: number = 1, limit: number = 10): Promise<WatchlistEntryResponse> {
    return apiGet<WatchlistEntryResponse>(`${this.basePath}?page=${page}&limit=${limit}`);
  }

  async removeFromWatchlist(videoId: string): Promise<{ success: boolean }> {
    await apiDelete(`${this.basePath}/${videoId}`);
    return { success: true };
  }

  async markAsUnwatched(id: string): Promise<WatchlistEntry> {
    return apiPut<WatchlistEntry>(`${this.basePath}/${id}/unwatched`, {});
  }

  async getWatchedVideos(userId?: string): Promise<WatchlistEntry[]> {
    let url = `${this.basePath}/watched`;
    if (userId) {
      url += `?userId=${userId}`;
    }
    return apiGet<WatchlistEntry[]>(url);
  }

  async getUnwatchedVideos(userId?: string): Promise<WatchlistEntry[]> {
    let url = `${this.basePath}/unwatched`;
    if (userId) {
      url += `?userId=${userId}`;
    }
    return apiGet<WatchlistEntry[]>(url);
  }

  async clearWatchlist(userId?: string): Promise<{ deleted: number }> {
    let url = `${this.basePath}/clear`;
    if (userId) {
      url += `?userId=${userId}`;
    }
    await apiDelete(url);
    return { deleted: 1 }; // Assumindo que pelo menos um item foi deletado
  }

  async isInWatchlist(videoId: string): Promise<boolean> {
    const response = await apiGet<{ inWatchlist: boolean }>(`${this.basePath}/check/${videoId}`);
    return response.inWatchlist;
  }
}

export const watchlistEntryService = new WatchlistEntryService();
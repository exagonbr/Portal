import { BaseApiService } from './base-api-service';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

export interface NotificationQueue {
  id: string;
  type: string;
  description?: string;
  movieId?: string;
  tvShowId?: string;
  videoToPlayId?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationQueueDto {
  type: string;
  description?: string;
  movieId?: string;
  tvShowId?: string;
  videoToPlayId?: string;
}

export interface UpdateNotificationQueueDto {
  type?: string;
  description?: string;
  movieId?: string;
  tvShowId?: string;
  videoToPlayId?: string;
  isCompleted?: boolean;
}

export interface NotificationQueueResponse {
  data: NotificationQueue[];
  total: number;
}

class NotificationQueueService extends BaseApiService<NotificationQueue> {
  constructor() {
    super('/api/notification-queue');
  }

  async getAllWithPagination(page: number = 1, limit: number = 10): Promise<NotificationQueueResponse> {
    const response = await apiGet<NotificationQueueResponse>(`${this.basePath}?page=${page}&limit=${limit}`);
    return response;
  }

  async processQueue(): Promise<{ processed: number; errors: number }> {
    const response = await apiPost<{ processed: number; errors: number }>(`${this.basePath}/process`, {});
    return response;
  }
}

export const notificationQueueService = new NotificationQueueService();
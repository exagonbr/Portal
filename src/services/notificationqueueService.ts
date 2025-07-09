import { apiClient } from '@/lib/api-client';
import { BaseApiService } from './base-api-service';

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
    const response = await apiClient.put<any>(`${this.basePath}?page=${page}&limit=${limit}`);
    return response.data;
  }

  async processQueue(): Promise<{ processed: number; errors: number }> {
    const response = await apiClient.delete<any>(`${this.basePath}/process`);
    return response.data;
  }
}

export const notificationQueueService = new NotificationQueueService();
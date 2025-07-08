import { BaseApiService } from './base-api-service';
import { apiClient } from '@/lib/api-client';

export interface ActivitySession {
  id: string;
  sessionId: string;
  userId: string;
  startTime: string;
  endTime?: string;
  durationSeconds?: number;
  pageViews?: number;
  actionsCount?: number;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: any;
  isActive?: boolean;
  lastActivity?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivitySessionDto {
  sessionId: string;
  userId: string;
  startTime?: string;
  pageViews?: number;
  actionsCount?: number;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: any;
}

export interface UpdateActivitySessionDto {
  endTime?: string;
  durationSeconds?: number;
  pageViews?: number;
  actionsCount?: number;
  isActive?: boolean;
  lastActivity?: string;
}

export interface ActivitySessionsResponse {
  data: ActivitySession[];
  total: number;
}

class ActivitySessionsService extends BaseApiService<ActivitySession> {
  constructor() {
    super('/api/activity-sessions');
  }

  async getAllWithPagination(page: number = 1, limit: number = 10): Promise<ActivitySessionsResponse> {
    const response = await apiClient.get<ActivitySessionsResponse>(`${this.basePath}?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getByUserId(userId: string): Promise<ActivitySession[]> {
    const response = await apiClient.get<ActivitySession[]>(`${this.basePath}/user/${userId}`);
    return response.data;
  }

  async getActiveSessions(): Promise<ActivitySession[]> {
    const response = await apiClient.get<ActivitySession[]>(`${this.basePath}/active`);
    return response.data;
  }

  async endSession(id: string): Promise<ActivitySession> {
    const response = await apiClient.put<ActivitySession>(`${this.basePath}/${id}/end`);
    return response.data;
  }

  async updateActivity(id: string, data: { pageViews?: number; actionsCount?: number }): Promise<ActivitySession> {
    const response = await apiClient.put<ActivitySession>(`${this.basePath}/${id}/activity`, data);
    return response.data;
  }
}

export const activitySessionsService = new ActivitySessionsService(); 
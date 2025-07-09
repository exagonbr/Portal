import { apiClient } from '@/lib/api-client';
import { BaseApiService } from './base-api-service';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

export interface ActivitySummary {
  id: string;
  userId: string;
  date: string;
  totalTimeSeconds: number;
  pageViews: number;
  videoTimeSeconds: number;
  videosWatched: number;
  quizzesAttempted: number;
  assignmentsSubmitted: number;
  loginCount: number;
  uniqueSessions: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateActivitySummaryDto {
  userId: string;
  date: string;
  totalTimeSeconds?: number;
  pageViews?: number;
  videoTimeSeconds?: number;
  videosWatched?: number;
  quizzesAttempted?: number;
  assignmentsSubmitted?: number;
  loginCount?: number;
  uniqueSessions?: number;
}

export interface UpdateActivitySummaryDto {
  totalTimeSeconds?: number;
  pageViews?: number;
  videoTimeSeconds?: number;
  videosWatched?: number;
  quizzesAttempted?: number;
  assignmentsSubmitted?: number;
  loginCount?: number;
  uniqueSessions?: number;
}

export interface ActivitySummariesResponse {
  data: ActivitySummary[];
  total: number;
}

export interface ActivityStats {
  totalUsers: number;
  totalSessions: number;
  totalTimeHours: number;
  totalVideosWatched: number;
  totalQuizzesAttempted: number;
  averageSessionTime: number;
}

class ActivitySummariesService extends BaseApiService<ActivitySummary> {
  constructor() {
    super('/api/activity-summaries');
  }

  async getAllWithPagination(page: number = 1, limit: number = 10): Promise<ActivitySummariesResponse> {
    return apiGet<ActivitySummariesResponse>(`${this.basePath}?page=${page}&limit=${limit}`);
  }

  async getByUserId(userId: string, startDate?: string, endDate?: string): Promise<ActivitySummary[]> {
    let url = `${this.basePath}/user/${userId}`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return apiGet<ActivitySummary[]>(url);
  }

  async getByDateRange(startDate: string, endDate: string): Promise<ActivitySummary[]> {
    return apiGet<ActivitySummary[]>(`${this.basePath}/date-range?startDate=${startDate}&endDate=${endDate}`);
  }

  async getStats(startDate?: string, endDate?: string): Promise<ActivityStats> {
    let url = `${this.basePath}/stats`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return apiGet<ActivityStats>(url);
  }

  async generateReport(userId?: string, startDate?: string, endDate?: string): Promise<Blob> {
    let url = `${this.basePath}/report`;
    const params = new URLSearchParams();
    
    if (userId) params.append('userId', userId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao gerar relatório');
    }

    return response.blob();
  }
}

export const activitySummariesService = new ActivitySummariesService(); 
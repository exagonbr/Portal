import { apiClient } from '@/lib/api-client';
import { BaseApiService } from './base-api-service';

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
    const response = await fetch(`${this.basePath}?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar resumos de atividade');
    }

    return response.json();
  }

  async getByUserId(userId: string, startDate?: string, endDate?: string): Promise<ActivitySummary[]> {
    let url = `${this.basePath}/user/${userId}`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar resumos do usuário');
    }

    return response.json();
  }

  async getByDateRange(startDate: string, endDate: string): Promise<ActivitySummary[]> {
    const response = await fetch(`${this.basePath}/date-range?startDate=${startDate}&endDate=${endDate}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar resumos por período');
    }

    return response.json();
  }

  async getStats(startDate?: string, endDate?: string): Promise<ActivityStats> {
    let url = `${this.basePath}/stats`;
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao buscar estatísticas de atividade');
    }

    return response.json();
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
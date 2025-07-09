import { apiClient } from '@/lib/api-client';
import { getApiUrl } from '@/config/env';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export class BaseApiService<T> {
  protected basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async getAll(): Promise<T[]> {
    const response = await apiClient.get<T[]>(this.basePath);
    if (!response.data) throw new Error('No data received');
    return response.data;
  }

  async getById(id: string | number): Promise<T> {
    const response = await apiClient.get<T>(`${this.basePath}/${id}`);
    if (!response.data) throw new Error('No data received');
    return response.data;
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await apiClient.post<T>(this.basePath, data);
    if (!response.data) throw new Error('No data received');
    return response.data;
  }

  async update(id: string | number, data: Partial<T>): Promise<T> {
    const response = await apiClient.put<T>(`${this.basePath}/${id}`, data);
    if (!response.data) throw new Error('No data received');
    return response.data;
  }

  async delete(id: string | number): Promise<void> {
    await apiClient.delete(`${this.basePath}/${id}`);
  }

  protected getFullUrl(path: string = ''): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return getApiUrl(this.basePath + cleanPath);
  }
} 
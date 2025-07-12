import { apiGet, apiPost, apiPut, apiDelete } from './apiService';
import { getApiUrl } from '@/config/env';
import { AuthHeaderService } from './authHeaderService';

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
    const response = await apiGet<T[]>(this.basePath);
    return response;
  }

  async getById(id: string | number): Promise<T> {
    const response = await apiGet<T>(`${this.basePath}/${id}`);
    return response;
  }

  async create(data: Partial<T>): Promise<T> {
    const response = await apiPost<T>(this.basePath, data);
    return response;
  }

  async update(id: string | number, data: Partial<T>): Promise<T> {
    const response = await apiPut<T>(`${this.basePath}/${id}`, data);
    return response;
  }

  async delete(id: string | number): Promise<void> {
    return apiDelete(`${this.basePath}/${id}`);
  }

  protected getFullUrl(path: string = ''): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return getApiUrl(this.basePath + cleanPath);
  }
  
  /**
   * Retorna os headers para requisições HTTP, incluindo o token de autorização
   * @param includeContentType - Se deve incluir o header Content-Type: application/json
   * @returns Headers para uso em requisições fetch
   */
  protected async getHeaders(includeContentType: boolean = true): Promise<Headers> {
    return AuthHeaderService.getHeaders(includeContentType);
  }
} 
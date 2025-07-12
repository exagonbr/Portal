import { apiGet, apiPost, apiPut, apiDelete } from './apiService';
import { BaseApiService } from './base-api-service';
import { UnifiedAuthService } from './unifiedAuthService';
import { AuthHeaderService } from './authHeaderService';

/**
 * Interface para representar uma configuração do sistema
 */
export interface SystemSettingItem {
  id?: string;
  key: string;
  value: string;
  type: string;
  description?: string;
  category: string;
  is_public: boolean;
  is_encrypted: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Interface para estatísticas das configurações do sistema
 */
export interface SystemSettingsStats {
  totalCount: number;
  categoryCounts: Record<string, number>;
  publicCount: number;
  privateCount: number;
  encryptedCount: number;
}

class SystemSettingsService extends BaseApiService<SystemSettingItem> {
  constructor() {
    super('/api/system-settings');
  }

  async getAllWithPagination(page: number = 1, limit: number = 10): Promise<{ data: SystemSettingItem[]; total: number }> {
    return apiGet<{ data: SystemSettingItem[]; total: number }>(`${this.basePath}?page=${page}&limit=${limit}`);
  }

  async getByCategory(category: string): Promise<SystemSettingItem[]> {
    return apiGet<SystemSettingItem[]>(`${this.basePath}/category/${category}`);
  }

  async getPublicSettings(): Promise<SystemSettingItem[]> {
    return apiGet<SystemSettingItem[]>(`${this.basePath}/public`);
  }

  async updateSetting(key: string, value: string): Promise<SystemSettingItem> {
    return apiPut<SystemSettingItem>(`${this.basePath}/${key}`, { value });
  }

  async getStats(): Promise<SystemSettingsStats> {
    return apiGet<SystemSettingsStats>(`${this.basePath}/stats`);
  }

  async importSettings(file: File): Promise<{ success: boolean; imported: number }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.basePath}/import`, {
      method: 'POST',
      headers: await this.getHeaders(false),
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Falha ao importar configurações');
    }

    return response.json();
  }

  async exportSettings(): Promise<Blob> {
    const response = await fetch(`${this.basePath}/export`, {
      headers: await this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Falha ao exportar configurações');
    }

    return response.blob();
  }

  private async getHeaders(includeContentType: boolean = true): Promise<HeadersInit> {
    return AuthHeaderService.getHeaders(includeContentType);
  }
}

export const systemSettingsService = new SystemSettingsService(); 
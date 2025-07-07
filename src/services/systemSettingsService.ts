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

/**
 * Uma função helper para fazer requisições fetch e tratar erros.
 */
const fetcher = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const token = localStorage.getItem('authToken');
  const headers = new Headers(options?.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'omit',
  });

  if (!res.ok) {
    const error = new Error('Ocorreu um erro ao buscar os dados de configurações.');
    try {
        const errorData = await res.json();
        (error as any).info = errorData;
    } catch (e) {
        (error as any).info = { message: 'Não foi possível analisar a resposta de erro.' };
    }
    (error as any).status = res.status;
    throw error;
  }
  return res.json();
};

/**
 * O objeto de serviço para gerenciar configurações do sistema
 */
export const systemSettingsService = {
  /**
   * Busca todas as configurações do sistema
   */
  getAllSettings: async (): Promise<SystemSettingItem[]> => {
    return fetcher<SystemSettingItem[]>('/api/admin/system/settings/all');
  },

  /**
   * Busca uma configuração específica pelo ID
   */
  getSettingById: async (id: string): Promise<SystemSettingItem> => {
    return fetcher<SystemSettingItem>(`/api/admin/system/settings/${id}`);
  },

  /**
   * Busca configurações por categoria
   */
  getSettingsByCategory: async (category: string): Promise<SystemSettingItem[]> => {
    return fetcher<SystemSettingItem[]>(`/api/admin/system/settings/category/${category}`);
  },

  /**
   * Atualiza uma configuração do sistema
   */
  updateSetting: async (id: string, data: Partial<SystemSettingItem>): Promise<SystemSettingItem> => {
    return fetcher<SystemSettingItem>(`/api/admin/system/settings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cria uma nova configuração do sistema
   */
  createSetting: async (data: Omit<SystemSettingItem, 'id'>): Promise<SystemSettingItem> => {
    return fetcher<SystemSettingItem>('/api/admin/system/settings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Exclui uma configuração do sistema
   */
  deleteSetting: async (id: string): Promise<{ success: boolean }> => {
    return fetcher<{ success: boolean }>(`/api/admin/system/settings/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Obtém estatísticas sobre as configurações do sistema
   */
  getSettingsStats: async (): Promise<SystemSettingsStats> => {
    return fetcher<SystemSettingsStats>('/api/admin/system/settings/stats');
  },

  /**
   * Exporta todas as configurações do sistema em formato JSON
   */
  exportSettings: async (): Promise<Blob> => {
    const response = await fetch('/api/admin/system/settings/export', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Falha ao exportar configurações');
    }

    return response.blob();
  },

  /**
   * Importa configurações do sistema a partir de um arquivo JSON
   */
  importSettings: async (file: File): Promise<{ success: boolean; count: number }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/admin/system/settings/import', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Falha ao importar configurações');
    }

    return response.json();
  },
}; 
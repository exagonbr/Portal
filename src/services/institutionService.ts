import { CrudService } from './crudService';
import { InstitutionDto } from '@/types/institution';
import { apiPost, apiGet } from './apiService';
import { ApiResponse } from '@/types/api';

export class InstitutionService extends CrudService<InstitutionDto> {
  constructor() {
    super('/api/institutions');
  }

  async uploadLogo(id: number, file: File) {
    const formData = new FormData();
    formData.append('logo', file);

    // O endpoint da API deve ser construído de forma mais robusta
    const response = await fetch(`/api/institutions/${id}/logo`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Falha no upload do logo');
    }

    return response.json();
  }

  async getStats(id: number) {
    return apiGet(`/institutions/${id}/stats`);
  }

  async toggleInstitutionStatus(id: number) {
    return apiPost(`/institutions/${id}/toggle-status`, {});
  }

  async canDeleteInstitution(id: number): Promise<boolean> {
    try {
      const response = await apiGet<{ canDelete: boolean }>(`/institutions/${id}/can-delete`);
      return response.canDelete;
    } catch (error) {
      console.error('Erro ao verificar se a instituição pode ser excluída:', error);
      // Em caso de erro, assumir que não pode ser excluída para segurança
      return false;
    }
  }

  async getInstitutions(params: { page?: number; limit?: number; search?: string }) {
    const result = await apiGet<ApiResponse<{ items: InstitutionDto[]; stats: any; pagination: { total: number; page: number; } }>>('/api/institutions', params);
    
    if (result && result.data) {
      const { items, stats, pagination } = result.data;
      return {
        items: items || [],
        stats: stats || {},
        total: pagination?.total || 0,
        page: pagination?.page || 1,
      };
    }

    // Fallback for unexpected structure or empty response
    return { items: [], stats: {}, total: 0, page: 1 };
  }
}

// Exportar uma instância única do serviço
export const institutionService = new InstitutionService();
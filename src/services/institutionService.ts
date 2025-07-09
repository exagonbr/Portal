import { CrudService } from './crudService';
import { InstitutionDto } from '@/types/institution';
import { apiPost, apiGet } from './apiService';

// Função auxiliar para retry
const withRetry = async <T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`Tentativa falhou, tentando novamente em ${delay}ms...`, error);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return withRetry(fn, retries - 1, delay * 1.5);
  }
};

export class InstitutionService extends CrudService<InstitutionDto> {
  constructor() {
    super('/institutions');
  }

  async uploadLogo(id: number, file: File) {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await fetch(`/api/institutions/${id}/logo`, {
      method: 'POST',
      body: formData,
    });
    
    return response.json();
  }

  async getStats(id: number) {
    return apiGet(`/institutions/${id}/stats`);
  }

  async toggleInstitutionStatus(id: number) {
    return apiPost(`/institutions/${id}/toggle-status`, {});
  }

  async canDeleteInstitution(id: number) {
    try {
      const response = await apiGet<{ canDelete: boolean }>(`/institutions/${id}/can-delete`);
      return response.canDelete;
    } catch (error) {
      console.error('Error checking if institution can be deleted:', error);
      return false;
    }
  }

  async getInstitutions(params: { page?: number; limit?: number; search?: string }) {
    // Usar o método withRetry para tentar novamente em caso de falha
    return withRetry(() => this.getAll(params));
  }

  async createInstitution(data: Partial<InstitutionDto>) {
    return this.create(data);
  }

  async updateInstitution(id: number, data: Partial<InstitutionDto>) {
    return this.update(id, data);
  }

  async deleteInstitution(id: number) {
    return this.delete(id);
  }
}

export const institutionService = new InstitutionService();
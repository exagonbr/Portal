import { CrudService } from './crudService';
import { InstitutionDto } from '@/types/institution';
import { apiPost, apiGet } from './apiService';
import { ApiResponse } from '@/types/api';

// Remover o cache para garantir dados sempre atualizados
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
    console.log('🔄 [API] Buscando TODAS as instituições do banco de dados');
    
    try {
      // Definir um limite alto para garantir que todos os registros sejam retornados
      const queryParams = {
        ...params,
        limit: 1000, // Limite alto para trazer todos os registros
        page: 1      // Sempre começar da primeira página
      };
      
      // Buscar dados diretamente da API sem cache
      const result = await apiGet('/institutions', queryParams);
      
      console.log('📊 Resposta completa da API:', JSON.stringify(result));
      
      // Processar o resultado para adaptar ao formato esperado pela interface
      let processedResult;
      
      // Verificar se o resultado está no novo formato
      if (result && typeof result === 'object' && 'success' in result && 'data' in result) {
        // Novo formato: { success: true, data: { items: [...], pagination: {...} } }
        const { items, pagination } = (result as ApiResponse<any>).data;
        
        console.log(`📊 Encontradas ${items?.length || 0} instituições de um total de ${pagination?.total || 'desconhecido'}`);
        
        if (items && items.length > 0) {
          console.log('📊 Primeira instituição:', items[0]);
          if (items.length > 1) {
            console.log('📊 Última instituição:', items[items.length - 1]);
          }
        }
        
        // Mapear os itens para garantir compatibilidade com o formato esperado
        const mappedItems = items?.map((item: any) => ({
          ...item,
          // Garantir que campos essenciais estejam presentes
          is_active: item.is_active !== undefined ? item.is_active : !item.deleted,
          type: item.type || 'SCHOOL', // Valor padrão se não existir
          schools_count: item.schools_count || 0,
          users_count: item.users_count || 0
        })) || [];
        
        processedResult = {
          items: mappedItems,
          total: pagination?.total || mappedItems.length,
          page: pagination?.page || params.page || 1,
          limit: pagination?.limit || params.limit || 10,
          totalPages: pagination?.totalPages || Math.ceil((pagination?.total || mappedItems.length) / (params.limit || 10))
        };
      } else {
        // Formato antigo ou outro formato
        console.log('📊 Formato antigo ou desconhecido:', result);
        processedResult = result;
      }
      
      return processedResult;
    } catch (error) {
      console.error('Erro ao buscar instituições:', error);
      throw error;
    }
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

// Exportar uma instância única do serviço
export const institutionService = new InstitutionService();
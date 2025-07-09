import {
  CertificateDto,
  CreateCertificateDto,
  UpdateCertificateDto,
  CertificateFilter,
  CertificateStats,
} from '@/types/certificate';
import {
  PaginatedResponse,
  CertificateResponseDto as ApiCertificateResponseDto,
  ApiResponse,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

const ENDPOINT = '/certificates';

// Função para mapear a resposta da API para o DTO do frontend
const mapToCertificateDto = (data: ApiCertificateResponseDto): CertificateDto => ({
  id: String(data.id),
  path: data.path,
  score: data.score,
  tv_show_id: data.tv_show_id || undefined,
  user_id: data.user_id || undefined,
  document: data.document,
  license_code: data.license_code,
  tv_show_name: data.tv_show_name,
  recreate: data.recreate,
  created_at: data.date_created,
  updated_at: data.last_updated || new Date().toISOString(),
});

export const getCertificates = async (params: CertificateFilter): Promise<ApiResponse<PaginatedResponse<CertificateDto>>> => {
  try {
    const response = await apiGet<ApiResponse<PaginatedResponse<ApiCertificateResponseDto>>>(`${ENDPOINT}`, params);
    
    // Se a resposta indica erro de autenticação, retornar o erro
    if (!response.success && response.message?.includes('autenticação')) {
      return {
        success: false,
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
        message: response.message
      };
    }
    
    // Verificar se a resposta tem o formato esperado
    if (!response || !response.data || !response.data.items || !Array.isArray(response.data.items)) {
      console.warn('Resposta da API de certificados não tem o formato esperado:', response);
      return {
        success: false,
        data: {
          items: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
        message: 'Formato de resposta inválido'
      };
    }
    
    return {
      ...response,
      data: {
        ...response.data,
        items: response.data.items.map(mapToCertificateDto),
      }
    };
  } catch (error) {
    console.error('Erro ao buscar certificados:', error);
    return {
      success: false,
      data: {
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
      message: error instanceof Error ? error.message : 'Erro ao buscar certificados'
    };
  }
};

export const getCertificateById = async (id: number): Promise<CertificateDto> => {
  try {
    const response = await apiGet<ApiResponse<ApiCertificateResponseDto>>(`${ENDPOINT}/${id}`);
    if (!response.data) {
      throw new Error('Certificado não encontrado');
    }
    return mapToCertificateDto(response.data);
  } catch (error) {
    console.error(`❌ Erro ao buscar certificado ${id}:`, error);
    throw error;
  }
};

export const createCertificate = async (data: CreateCertificateDto): Promise<CertificateDto> => {
  try {
    const response = await apiPost<ApiResponse<ApiCertificateResponseDto>>(ENDPOINT, data);
    if (!response.data) {
      throw new Error('Erro ao criar certificado');
    }
    return mapToCertificateDto(response.data);
  } catch (error) {
    console.error('❌ Erro ao criar certificado:', error);
    throw error;
  }
};

export const updateCertificate = async (id: number, data: UpdateCertificateDto): Promise<CertificateDto> => {
  try {
    const response = await apiPut<ApiResponse<ApiCertificateResponseDto>>(`${ENDPOINT}/${id}`, data);
    if (!response.data) {
      throw new Error('Erro ao atualizar certificado');
    }
    return mapToCertificateDto(response.data);
  } catch (error) {
    console.error(`❌ Erro ao atualizar certificado ${id}:`, error);
    throw error;
  }
};

export const deleteCertificate = async (id: number): Promise<void> => {
  try {
    await apiDelete(`${ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`❌ Erro ao excluir certificado ${id}:`, error);
    throw error;
  }
};

export const getStats = async (): Promise<ApiResponse<CertificateStats>> => {
  try {
    return await apiGet<ApiResponse<CertificateStats>>(`${ENDPOINT}/stats`);
  } catch (error) {
    console.error('❌ Erro ao buscar estatísticas de certificados:', error);
    throw error;
  }
};

export const certificateService = {
  getCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  getStats,
};
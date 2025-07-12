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
import { apiService } from './api';

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
    const response = await apiService.get<ApiResponse<PaginatedResponse<ApiCertificateResponseDto>>>('/certificates', { params });
    
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
    throw error;
  }
};

export const getCertificateById = async (id: string): Promise<CertificateDto> => {
  const response = await apiService.get<ApiCertificateResponseDto>(`/certificates/${id}`);
  return mapToCertificateDto(response);
};

export const createCertificate = async (data: CreateCertificateDto): Promise<CertificateDto> => {
  const response = await apiService.post<ApiCertificateResponseDto>('/certificates', data);
  return mapToCertificateDto(response);
};

export const updateCertificate = async (id: string, data: UpdateCertificateDto): Promise<CertificateDto> => {
  const response = await apiService.put<ApiCertificateResponseDto>(`/certificates/${id}`, data);
  return mapToCertificateDto(response);
};

export const deleteCertificate = async (id: string): Promise<void> => {
  await apiService.delete(`/certificates/${id}`);
};

export const getCertificateStats = async (): Promise<CertificateStats> => {
  return await apiService.get<CertificateStats>('/certificates/stats');
};
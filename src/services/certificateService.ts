import {
  CertificateDto,
  CreateCertificateDto,
  UpdateCertificateDto,
  CertificateFilter,
} from '@/types/certificate';
import {
  PaginatedResponse,
  CertificateResponseDto as ApiCertificateResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

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

export const getCertificates = async (params: CertificateFilter): Promise<PaginatedResponse<CertificateDto>> => {
  const response = await apiGet<PaginatedResponse<ApiCertificateResponseDto>>('/certificates', params);
  return {
    ...response,
    items: response.items.map(mapToCertificateDto),
  };
};

export const getCertificateById = async (id: number): Promise<CertificateDto> => {
  const response = await apiGet<ApiCertificateResponseDto>(`/certificates/${id}`);
  return mapToCertificateDto(response);
};

export const createCertificate = async (data: CreateCertificateDto): Promise<CertificateDto> => {
  const response = await apiPost<ApiCertificateResponseDto>('/certificates', data);
  return mapToCertificateDto(response);
};

export const updateCertificate = async (id: number, data: UpdateCertificateDto): Promise<CertificateDto> => {
  const response = await apiPut<ApiCertificateResponseDto>(`/certificates/${id}`, data);
  return mapToCertificateDto(response);
};

export const deleteCertificate = async (id: number): Promise<void> => {
  return apiDelete(`/certificates/${id}`);
};

export const certificateService = {
  getCertificates,
  getCertificateById,
  createCertificate,
  updateCertificate,
  deleteCertificate,
};
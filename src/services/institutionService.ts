import {
  InstitutionDto,
  CreateInstitutionDto,
  UpdateInstitutionDto,
  InstitutionStats,
  InstitutionAnalytics,
  InstitutionType,
  InstitutionNature,
} from '@/types/institution';
import {
  PaginatedResponse,
  InstitutionResponseDto,
  ClassResponseDto,
  UserResponseDto,
  ScheduleResponseDto,
  ApiResponse,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToInstitutionDto = (data: InstitutionResponseDto): InstitutionDto => ({
  id: String(data.id),
  name: data.name,
  code: data.document, // Mapeando document para code como no componente
  cnpj: data.document,
  type: data.has_principal_platform ? InstitutionType.UNIVERSITY : InstitutionType.SCHOOL, // Lógica de exemplo
  nature: InstitutionNature.PRIVATE, // Valor padrão
  description: `Institution ${data.name}`,
  email: data.accountable_contact || `contact@${data.name.toLowerCase().replace(/\s/g, '')}.com`,
  phone: data.accountable_contact || '',
  website: `www.${data.name.toLowerCase().replace(/\s/g, '')}.com`,
  address: data.street,
  city: data.district,
  state: data.state,
  zip_code: data.postal_code,
  logo_url: '', // A API não parece fornecer isto
  is_active: !data.deleted,
  created_at: data.date_created || new Date().toISOString(),
  updated_at: data.last_updated || new Date().toISOString(),
  schools_count: 0, // A API não parece fornecer isto - será calculado separadamente
  users_count: 0, // A API não parece fornecer isto - será calculado separadamente
});

// Parâmetros de filtro para getInstitutions
interface GetInstitutionsParams {
  page?: number;
  limit?: number;
  search?: string;
  active?: boolean;
}

export const getInstitutions = async (params: GetInstitutionsParams): Promise<PaginatedResponse<InstitutionDto>> => {
  const response = await apiGet<PaginatedResponse<InstitutionResponseDto>>('/institutions', params);
  return {
    ...response,
    items: response.items.map(mapToInstitutionDto),
  };
};

export const getInstitutionById = async (id: number): Promise<InstitutionDto> => {
  const response = await apiGet<InstitutionResponseDto>(`/institutions/${id}`);
  return mapToInstitutionDto(response);
};

export const createInstitution = async (data: CreateInstitutionDto): Promise<InstitutionDto> => {
  const response = await apiPost<InstitutionResponseDto>('/institutions', data);
  return mapToInstitutionDto(response);
};

export const updateInstitution = async (id: number, data: UpdateInstitutionDto): Promise<InstitutionDto> => {
  const response = await apiPut<InstitutionResponseDto>(`/institutions/${id}`, data);
  return mapToInstitutionDto(response);
};

export const deleteInstitution = async (id: number): Promise<void> => {
  return apiDelete(`/institutions/${id}`);
};

export const toggleInstitutionStatus = async (id: number): Promise<InstitutionDto> => {
  // A API real pode ter um endpoint PATCH dedicado. Aqui, simulamos obtendo e invertendo o status.
  const institution = await getInstitutionById(id);
  const updatedData = { deleted: institution.is_active };
  const response = await apiPut<InstitutionResponseDto>(`/institutions/${id}`, updatedData);
  return mapToInstitutionDto(response);
};

export const canDeleteInstitution = async (id: number): Promise<boolean> => {
  // Esta é uma simulação. Uma API real teria um endpoint para isto.
  // Por exemplo: const response = await apiGet<{ canDelete: boolean }>(`/institutions/${id}/can-delete`);
  // Simulando que uma instituição com ID par não pode ser excluída.
  return id % 2 !== 0;
};

export const getInstitutionStats = async (id: string): Promise<InstitutionStats> => {
  return apiGet<InstitutionStats>(`/institutions/${id}/stats`);
};

export const getInstitutionUsers = async (id: string): Promise<UserResponseDto[]> => {
  return apiGet<UserResponseDto[]>(`/institutions/${id}/users`);
};

export const getInstitutionClasses = async (id: string): Promise<ClassResponseDto[]> => {
  return apiGet<ClassResponseDto[]>(`/institutions/${id}/classes`);
};

export const getInstitutionSchedules = async (id: string): Promise<ScheduleResponseDto[]> => {
  return apiGet<ScheduleResponseDto[]>(`/institutions/${id}/schedules`);
};

export const getInstitutionAnalytics = async (id: string): Promise<InstitutionAnalytics> => {
  return apiGet<InstitutionAnalytics>(`/institutions/${id}/analytics`);
};

const institutionService = {
  getInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  deleteInstitution,
  toggleInstitutionStatus,
  canDeleteInstitution,
  getInstitutionStats,
  getInstitutionUsers,
  getInstitutionClasses,
  getInstitutionSchedules,
  getInstitutionAnalytics,
};

export default institutionService;
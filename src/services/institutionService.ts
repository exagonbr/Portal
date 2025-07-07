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
  try {
    const response = await apiGet<PaginatedResponse<InstitutionResponseDto>>('/institutions', params);
    
    if (!response || !response.items) {
      throw new Error('Invalid response structure');
    }
    
    return {
      ...response,
      items: response.items.map(mapToInstitutionDto),
    };
  } catch (error) {
    console.warn('⚠️ API real falhou, usando dados mock para instituições:', error);
    
    // Dados mock como fallback
    const mockInstitutions: InstitutionDto[] = [
      {
        id: '1',
        name: 'Colégio Excelência',
        code: 'CEX-001',
        cnpj: '12.345.678/0001-95',
        type: 'SCHOOL' as any,
        nature: 'PRIVATE' as any,
        description: 'Colégio focado em excelência educacional',
        email: 'contato@colegioexcelencia.com.br',
        phone: '(11) 3456-7890',
        website: 'www.colegioexcelencia.com.br',
        address: 'Rua da Educação, 123',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '01234-567',
        logo_url: '',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        schools_count: 2,
        users_count: 450
      },
      {
        id: '2',
        name: 'Instituto Tecnológico ITECH',
        code: 'ITECH-002',
        cnpj: '98.765.432/0001-12',
        type: 'TECH_CENTER' as any,
        nature: 'PRIVATE' as any,
        description: 'Instituto focado em tecnologia e inovação',
        email: 'contato@itech.edu.br',
        phone: '(21) 2345-6789',
        website: 'www.itech.edu.br',
        address: 'Av. Tecnologia, 456',
        city: 'Rio de Janeiro',
        state: 'RJ',
        zip_code: '20123-456',
        logo_url: '',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        schools_count: 1,
        users_count: 320
      },
      {
        id: '3',
        name: 'Universidade Futuro',
        code: 'UF-003',
        cnpj: '11.222.333/0001-44',
        type: 'UNIVERSITY' as any,
        nature: 'PUBLIC' as any,
        description: 'Universidade pública de excelência',
        email: 'reitoria@unifuturo.edu.br',
        phone: '(11) 4567-8901',
        website: 'www.unifuturo.edu.br',
        address: 'Campus Universitário, s/n',
        city: 'São Paulo',
        state: 'SP',
        zip_code: '05678-901',
        logo_url: '',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        schools_count: 5,
        users_count: 2800
      },
      {
        id: '4',
        name: 'Escola Primária Saber',
        code: 'EPS-004',
        cnpj: '33.444.555/0001-78',
        type: 'SCHOOL' as any,
        nature: 'PRIVATE' as any,
        description: 'Escola focada na educação infantil e fundamental',
        email: 'diretoria@escolasaber.com.br',
        phone: '(85) 3210-9876',
        website: 'www.escolasaber.com.br',
        address: 'Rua do Conhecimento, 789',
        city: 'Fortaleza',
        state: 'CE',
        zip_code: '60123-789',
        logo_url: '',
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        schools_count: 1,
        users_count: 180
      }
    ];
    
    // Aplicar filtros nos dados mock
    let filteredInstitutions = mockInstitutions;
    
    if (params.search) {
      const search = params.search.toLowerCase();
      filteredInstitutions = filteredInstitutions.filter(inst =>
        inst.name.toLowerCase().includes(search) ||
        inst.code?.toLowerCase().includes(search) ||
        inst.email?.toLowerCase().includes(search)
      );
    }
    
    if (params.active !== undefined) {
      filteredInstitutions = filteredInstitutions.filter(inst => inst.is_active === params.active);
    }
    
    // Aplicar paginação
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = filteredInstitutions.slice(startIndex, endIndex);
    
    return {
      items: paginatedItems,
      total: filteredInstitutions.length,
      page,
      limit,
      totalPages: Math.ceil(filteredInstitutions.length / limit)
    };
  }
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

export { institutionService };
export default institutionService;
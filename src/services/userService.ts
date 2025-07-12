import { UserResponseDto, UserFilterDto, PaginatedResponse, CreateUserDto, UpdateUserDto } from '@/types/api';
import { UserDto, UserFilter } from '@/types/user';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

const ENDPOINT = '/users';

// Função para mapear a resposta da API para o DTO do frontend
const mapToUserDto = (data: UserResponseDto): UserDto => ({
  id: String(data.id),
  name: data.full_name || 'Nome não informado',
  email: data.email,
  phone: data.phone,
  address: data.address,
  role_id: data.role_id || '',
  institution_id: data.institution_id || undefined,
  is_active: data.enabled || false,
  created_at: data.date_created || new Date().toISOString(),
  updated_at: data.last_updated || new Date().toISOString(),
});

// Função para mapear o filtro do frontend para o filtro da API
const mapToApiFilter = (filter: UserFilter): UserFilterDto => {
  // Mapeamento de campos do frontend para campos da API
  let sortBy: 'full_name' | 'email' | 'created_at' | 'updated_at' | undefined = undefined;
  
  if (filter.sortBy) {
    // Mapear campos do frontend para campos da API
    switch (filter.sortBy) {
      case 'name':
        sortBy = 'full_name';
        break;
      case 'email':
        sortBy = 'email';
        break;
      case 'created_at':
        sortBy = 'created_at';
        break;
      case 'updated_at':
        sortBy = 'updated_at';
        break;
      default:
        sortBy = undefined;
    }
  }
  
  return {
    page: filter.page,
    limit: filter.limit,
    search: filter.search,
    role_id: filter.role_id,
    institution_id: filter.institution_id,
    is_active: filter.is_active,
    sortBy,
    sortOrder: filter.sortOrder,
  };
};

export const getUsers = async (filters: UserFilter): Promise<PaginatedResponse<UserDto>> => {
  try {
    const apiFilters = mapToApiFilter(filters);
    const response = await apiGet<any>(ENDPOINT, apiFilters);
    console.log('🔍 [DEBUG] Resposta bruta da API de usuários:', JSON.stringify(response, null, 2));
    
    // Verificar diferentes formatos de resposta da API
    let items: UserResponseDto[] = [];
    let total = 0;
    let page = filters.page || 1;
    let limit = filters.limit || 10;
    let totalPages = 0;

    // Verificar se a resposta tem o formato padrão PaginatedResponse
    if (response && response.items && Array.isArray(response.items)) {
      items = response.items;
      total = response.total || 0;
      page = response.page || page;
      limit = response.limit || limit;
      totalPages = response.totalPages || Math.ceil(total / limit);
    }
    // Verificar se a resposta tem formato ApiResponse com data
    else if (response && response.data && response.data.items && Array.isArray(response.data.items)) {
      items = response.data.items;
      total = response.data.total || 0;
      page = response.data.page || page;
      limit = response.data.limit || limit;
      totalPages = response.data.totalPages || Math.ceil(total / limit);
    }
    // Verificar se a resposta é diretamente um array
    else if (response && Array.isArray(response)) {
      items = response;
      total = response.length;
      totalPages = Math.ceil(total / limit);
    }
    // Se não conseguiu identificar o formato, usar valores padrão
    else {
      console.warn('⚠️ [API] Formato de resposta não reconhecido para usuários:', response);
      items = [];
      total = 0;
      totalPages = 0;
    }

    const result: PaginatedResponse<UserDto> = {
      items: items.map(mapToUserDto),
      total,
      page,
      limit,
      totalPages,
    };

    return result;
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    
    // Retornar uma resposta vazia em caso de erro
    return {
      items: [],
      total: 0,
      page: filters.page || 1,
      limit: filters.limit || 10,
      totalPages: 0,
    };
  }
};

export const getUserById = async (id: string): Promise<UserDto> => {
  try {
    const response = await apiGet<UserResponseDto>(`${ENDPOINT}/${id}`);
    return mapToUserDto(response);
  } catch (error) {
    console.error(`❌ Erro ao buscar usuário ${id}:`, error);
    throw error;
  }
};

export const createUser = async (data: CreateUserDto): Promise<UserDto> => {
  try {
    const response = await apiPost<UserResponseDto>(ENDPOINT, data);
    return mapToUserDto(response);
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    throw error;
  }
};

export const updateUser = async (id: string, data: UpdateUserDto): Promise<UserDto> => {
  try {
    const response = await apiPut<UserResponseDto>(`${ENDPOINT}/${id}`, data);
    return mapToUserDto(response);
  } catch (error) {
    console.error(`❌ Erro ao atualizar usuário ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id: number): Promise<void> => {
  try {
    return await apiDelete(`${ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`❌ Erro ao excluir usuário ${id}:`, error);
    throw error;
  }
};

export const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
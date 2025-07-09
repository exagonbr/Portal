import { UserResponseDto, UserFilterDto, PaginatedResponse, CreateUserDto, UpdateUserDto } from '@/types/api';
import { UserDto, UserFilter } from '@/types/user';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

const ENDPOINT = '/users';

// Função para mapear a resposta da API para o DTO do frontend
const mapToUserDto = (data: UserResponseDto): UserDto => ({
  id: String(data.id),
  name: data.full_name,
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
    const response = await apiGet<PaginatedResponse<UserResponseDto>>(ENDPOINT, apiFilters);
    
    return {
      ...response,
      items: response.items.map(mapToUserDto)
    };
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    throw error;
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
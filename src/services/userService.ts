import {
  UserDto,
  CreateUserDto as FrontendCreateUserDto,
  UpdateUserDto as FrontendUpdateUserDto,
  UserFilter,
  ProfileDto,
  ChangePasswordDto,
} from '@/types/user';
import {
  PaginatedResponse,
  UserResponseDto as ApiUserResponseDto,
  CreateUserDto as ApiCreateUserDto,
  UpdateUserDto as ApiUpdateUserDto,
  ProfileResponseDto as ApiProfileResponseDto,
} from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from './apiService';

// Função para mapear a resposta da API para o DTO do frontend
const mapToUserDto = (data: ApiUserResponseDto): UserDto => ({
  id: String(data.id),
  name: data.full_name,
  email: data.email,
  cpf: '', // API não fornece CPF, deixar em branco
  phone: data.phone,
  birth_date: new Date().toISOString(), // API não fornece, usar placeholder
  address: data.address,
  city: '', // API não fornece
  state: '', // API não fornece
  zip_code: '', // API não fornece
  role_id: data.role_id || '',
  institution_id: data.institution_id || undefined,
  is_active: data.enabled || false,
  created_at: data.date_created || new Date().toISOString(),
  updated_at: data.last_updated || new Date().toISOString(),
});

const mapToProfileDto = (data: ApiProfileResponseDto): ProfileDto => ({
    id: String(data.id),
    user_id: String(data.user_id),
    avatar_color: data.avatar_color,
    is_child: data.is_child,
    language: data.profile_language,
    name: data.profile_name || 'Perfil sem nome',
});

export const getUsers = async (params: UserFilter): Promise<PaginatedResponse<UserDto>> => {
  const response = await apiGet<PaginatedResponse<ApiUserResponseDto>>('/users', params);
  return {
    ...response,
    items: response.items.map(mapToUserDto),
  };
};

export const getUserById = async (id: number): Promise<UserDto> => {
  const response = await apiGet<ApiUserResponseDto>(`/users/${id}`);
  return mapToUserDto(response);
};

export const createUser = async (data: FrontendCreateUserDto): Promise<UserDto> => {
  // Mapear DTO do frontend para DTO da API se necessário
  const apiData: ApiCreateUserDto = {
      email: data.email,
      full_name: data.name,
      password: data.password,
      institution_id: data.institution_id,
      role_id: data.role_id,
      enabled: data.is_active,
  };
  const response = await apiPost<ApiUserResponseDto>('/users', apiData);
  return mapToUserDto(response);
};

export const updateUser = async (id: number, data: FrontendUpdateUserDto): Promise<UserDto> => {
  // Mapear DTO do frontend para DTO da API se necessário
  const apiData: ApiUpdateUserDto = {
      full_name: data.name,
      email: data.email,
      password: data.password,
      institution_id: data.institution_id,
      role_id: data.role_id,
      enabled: data.is_active,
  };
  const response = await apiPut<ApiUserResponseDto>(`/users/${id}`, apiData);
  return mapToUserDto(response);
};

export const deleteUser = async (id: number): Promise<void> => {
  return apiDelete(`/users/${id}`);
};

export const toggleUserStatus = async (id: number): Promise<UserDto> => {
    const user = await getUserById(id);
    const response = await apiPatch<ApiUserResponseDto>(`/users/${id}/status`, { enabled: !user.is_active });
    return mapToUserDto(response);
};

export const changeUserPassword = async (id: number, data: ChangePasswordDto): Promise<void> => {
    return apiPost<void>(`/users/${id}/change-password`, data);
};

export const getUserProfile = async (id: number): Promise<ProfileDto> => {
    const response = await apiGet<ApiProfileResponseDto>(`/users/${id}/profile`);
    return mapToProfileDto(response);
};

export const userService = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  changeUserPassword,
  getUserProfile,
};
import { UserResponseDto, UserFilterDto, PaginatedResponse, CreateUserDto, UpdateUserDto } from '@/types/api';
import { apiGet, apiPost, apiPut, apiDelete } from './apiService';

const ENDPOINT = '/users';

export const getUsers = async (filters: UserFilterDto): Promise<PaginatedResponse<UserResponseDto>> => {
  return apiGet<PaginatedResponse<UserResponseDto>>(ENDPOINT, filters);
};

export const createUser = async (data: CreateUserDto): Promise<UserResponseDto> => {
    return apiPost<UserResponseDto>(ENDPOINT, data);
};

export const updateUser = async (id: string, data: UpdateUserDto): Promise<UserResponseDto> => {
    return apiPut<UserResponseDto>(`${ENDPOINT}/${id}`, data);
};

export const deleteUser = async (id: string): Promise<void> => {
    return apiDelete(`${ENDPOINT}/${id}`);
};

export const usersService = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
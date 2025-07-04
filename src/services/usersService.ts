import { UserResponseDto, UserFilterDto, PaginatedResponse, CreateUserDto, UpdateUserDto } from '@/types/api';

const API_BASE_URL = '/api';

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    try {
      const error = await response.json();
      throw new Error(error.message || `Erro na API: ${response.statusText}`);
    } catch (e) {
      throw new Error(`Erro na API: ${response.statusText}`);
    }
  }
  return response.json() as Promise<T>;
}

const getUsers = async (filters: UserFilterDto): Promise<PaginatedResponse<UserResponseDto>> => {
  const query = new URLSearchParams(filters as any).toString();
  const response = await fetch(`${API_BASE_URL}/users?${query}`);
  return handleResponse<PaginatedResponse<UserResponseDto>>(response);
};

const createUser = async (data: CreateUserDto): Promise<UserResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse<UserResponseDto>(response);
};

const updateUser = async (id: string, data: UpdateUserDto): Promise<UserResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return handleResponse<UserResponseDto>(response);
};

const deleteUser = async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro ao excluir usuário' }));
        throw new Error(error.message);
    }
};

export const usersService = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};
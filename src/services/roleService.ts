import { RoleResponseDto, RoleCreateDto, RoleUpdateDto, PaginatedResponse } from '@/types/api';

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

const getRoles = async (params: { page: number; limit: number; sortBy: string; sortOrder: string; }): Promise<PaginatedResponse<RoleResponseDto>> => {
  const query = new URLSearchParams(params as any).toString();
  const response = await fetch(`${API_BASE_URL}/roles?${query}`);
  return handleResponse<PaginatedResponse<RoleResponseDto>>(response);
};

const createRole = async (data: RoleCreateDto): Promise<RoleResponseDto> => {
  const response = await fetch(`${API_BASE_URL}/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<RoleResponseDto>(response);
};

const updateRole = async (id: string, data: RoleUpdateDto): Promise<RoleResponseDto> => {
  const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<RoleResponseDto>(response);
};

const deleteRole = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro ao excluir função' }));
    throw new Error(error.message);
  }
};

const toggleRoleStatus = async (id: string, active: boolean): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/roles/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active }),
    });
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Erro ao alterar status da função' }));
        throw new Error(error.message);
    }
};

export const roleService = {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  toggleRoleStatus,
};
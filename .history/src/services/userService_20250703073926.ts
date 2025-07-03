import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { API_ROUTES } from '@/config/urls';
import { ApiResponse, PaginatedResponseDto } from '@/types/api';

// Manter as interfaces que eram usadas localmente
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  username?: string;
  roleId: string;
  institutionId: number;
  address?: string;
  phone?: string;
  enabled: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  isCoordinator: boolean;
  isGuardian: boolean;
  isInstitutionManager: boolean;
  resetPassword: boolean;
  dateCreated: string;
  lastUpdated: string;
  role?: { id: string; name: string; description?: string; };
  institution?: { id: number; name: string; type?: string; };
}

export interface CreateUserData {
  email: string;
  password: string;
  full_name: string;
  roleId: string;
  institutionId: number;
  address?: string;
  phone?: string;
  username?: string;
  isAdmin?: boolean;
  isManager?: boolean;
  isStudent?: boolean;
  isTeacher?: boolean;
  isCoordinator?: boolean;
  isGuardian?: boolean;
  isInstitutionManager?: boolean;
  enabled?: boolean;
}

export interface UpdateUserData {
  email?: string;
  full_name?: string;
  roleId?: string;
  institutionId?: number;
  address?: string;
  phone?: string;
  username?: string;
  password?: string;
  isAdmin?: boolean;
  isManager?: boolean;
  isStudent?: boolean;
  isTeacher?: boolean;
  isCoordinator?: boolean;
  isGuardian?: boolean;
  isInstitutionManager?: boolean;
  enabled?: boolean;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  institutionId?: number;
  enabled?: boolean;
  sortBy?: 'full_name' | 'email' | 'dateCreated' | 'lastUpdated';
  sortOrder?: 'asc' | 'desc';
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<string, number>;
  byInstitution: Record<string, number>;
  newThisMonth: number;
}


// Helper para tratar a resposta da API
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Erro HTTP: ${response.status}` }));
    throw new Error(errorData.message || 'Ocorreu um erro desconhecido');
  }
  if (response.status === 204) {
    return null as T;
  }
  const result: ApiResponse<T> = await response.json();
  if (result.success === false || result.data === undefined) {
    throw new Error(result.message || 'A API retornou uma resposta inválida');
  }
  return result.data;
}

class UserService {
  async getStats(): Promise<UserStats> {
    const response = await apiGet(API_ROUTES.USERS.STATS);
    return handleApiResponse(response);
  }

  async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams(filters as any).toString();
    const response = await apiGet(`${API_ROUTES.USERS.BASE}?${params}`);
    // A resposta paginada tem um formato específico que não usa o `data` wrapper
    const result: PaginatedResponseDto<User> = await response.json();
    if (!response.ok) {
        throw new Error('Erro ao listar usuários');
    }
    return result;
  }

  async getUserById(id: string | number): Promise<User> {
    const response = await apiGet(API_ROUTES.USERS.BY_ID(id));
    return handleApiResponse(response);
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiGet(API_ROUTES.USERS.ME);
    return handleApiResponse(response);
  }

  async updateCurrentUser(data: Partial<UpdateUserData>): Promise<User> {
    const response = await apiPut(API_ROUTES.USERS.ME, data);
    return handleApiResponse(response);
  }

  async createUser(data: CreateUserData): Promise<User> {
    const response = await apiPost(API_ROUTES.USERS.BASE, data);
    return handleApiResponse(response);
  }

  async updateUser(id: string | number, data: UpdateUserData): Promise<User> {
    const response = await apiPut(API_ROUTES.USERS.BY_ID(id), data);
    return handleApiResponse(response);
  }

  async deleteUser(id: string | number): Promise<void> {
    const response = await apiDelete(API_ROUTES.USERS.BY_ID(id));
    await handleApiResponse(response);
  }

  async activateUser(id: string | number): Promise<void> {
    const response = await apiPost(API_ROUTES.USERS.ACTIVATE(id));
    await handleApiResponse(response);
  }

  async deactivateUser(id: string | number): Promise<void> {
    const response = await apiPost(API_ROUTES.USERS.DEACTIVATE(id));
    await handleApiResponse(response);
  }

  async resetPassword(id: string | number): Promise<void> {
    const response = await apiPost(API_ROUTES.USERS.RESET_PASSWORD(id));
    await handleApiResponse(response);
  }

  async searchUsers(query: string, filters: Partial<UserFilters> = {}): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({ ...filters, q: query } as any).toString();
    const response = await apiGet(`${API_ROUTES.USERS.SEARCH}?${params}`);
    const result: PaginatedResponseDto<User> = await response.json();
     if (!response.ok) {
        throw new Error('Erro na pesquisa');
    }
    return result;
  }

  async getUsersByRole(roleId: string): Promise<User[]> {
    const response = await apiGet(API_ROUTES.USERS.BY_ROLE(roleId));
    return handleApiResponse(response);
  }

  async getUsersByInstitution(institutionId: number): Promise<User[]> {
    const response = await apiGet(API_ROUTES.USERS.BY_INSTITUTION(institutionId));
    return handleApiResponse(response);
  }
}

export const userService = new UserService();
export default userService;
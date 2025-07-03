import { 
  apiGet, 
  apiPost, 
  apiPut, 
  apiDelete, 
  parseJsonResponse 
} from '@/lib/api-client';
import { API_ROUTES } from '@/config/urls';
import { ApiResponse } from '@/types/api';

// --- Tipos ---
// Idealmente, estes tipos deveriam ser movidos para um arquivo central como @/types/user.ts

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

export interface CreateUserData extends Omit<User, 'id' | 'dateCreated' | 'lastUpdated'> {
  password?: string;
}

export interface UpdateUserData extends Partial<CreateUserData> {}

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

// --- Helper ---

async function processApiResponse<T>(response: Response): Promise<T> {
  const result: ApiResponse<T> = await parseJsonResponse(response);
  if (result.success === false || result.data === undefined) {
    throw new Error(result.message || 'A API retornou uma resposta inválida.');
  }
  return result.data;
}

// --- Classe de Serviço ---

class UserService {
  async getStats(): Promise<UserStats> {
    const response = await apiGet(API_ROUTES.USERS.STATS);
    return processApiResponse(response);
  }

  async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams(filters as any).toString();
    const response = await apiGet(`${API_ROUTES.USERS.BASE}?${params}`);
    // Respostas paginadas podem não usar o wrapper `data`, então tratamos separadamente.
    return parseJsonResponse(response);
  }

  async getUserById(id: string | number): Promise<User> {
    const response = await apiGet(API_ROUTES.USERS.BY_ID(id));
    return processApiResponse(response);
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiGet(API_ROUTES.USERS.ME);
    return processApiResponse(response);
  }

  async updateCurrentUser(data: UpdateUserData): Promise<User> {
    const response = await apiPut(API_ROUTES.USERS.ME, data);
    return processApiResponse(response);
  }

  async createUser(data: CreateUserData): Promise<User> {
    const response = await apiPost(API_ROUTES.USERS.BASE, data);
    return processApiResponse(response);
  }

  async updateUser(id: string | number, data: UpdateUserData): Promise<User> {
    const response = await apiPut(API_ROUTES.USERS.BY_ID(id), data);
    return processApiResponse(response);
  }

  async deleteUser(id: string | number): Promise<void> {
    const response = await apiDelete(API_ROUTES.USERS.BY_ID(id));
    // Para DELETE, podemos não ter corpo na resposta, então não usamos processApiResponse
    await parseJsonResponse(response);
  }

  async activateUser(id: string | number): Promise<void> {
    const response = await apiPost(API_ROUTES.USERS.ACTIVATE(id));
    await processApiResponse(response);
  }

  async deactivateUser(id: string | number): Promise<void> {
    const response = await apiPost(API_ROUTES.USERS.DEACTIVATE(id));
    await processApiResponse(response);
  }

  async resetPassword(id: string | number): Promise<void> {
    const response = await apiPost(API_ROUTES.USERS.RESET_PASSWORD(id));
    await processApiResponse(response);
  }

  async searchUsers(query: string, filters: Partial<UserFilters> = {}): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({ ...filters, q: query } as any).toString();
    const response = await apiGet(`${API_ROUTES.USERS.SEARCH}?${params}`);
    return parseJsonResponse(response);
  }

  async getUsersByRole(roleId: string): Promise<User[]> {
    const response = await apiGet(API_ROUTES.USERS.BY_ROLE(roleId));
    return processApiResponse(response);
  }

  async getUsersByInstitution(institutionId: number): Promise<User[]> {
    const response = await apiGet(API_ROUTES.USERS.BY_INSTITUTION(institutionId));
    return processApiResponse(response);
  }
}

export const userService = new UserService();
export default userService;
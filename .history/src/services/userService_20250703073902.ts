import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api-client';
import { API_ROUTES } from '@/config/urls';
import {
  User,
  CreateUserData,
  UpdateUserData,
  UserFilters,
  UserStats,
  PaginatedResponse,
} from '@/types/user'; // Supondo que os tipos foram movidos para um arquivo dedicado
import { ApiResponse } from '@/types/api';

// Helper para tratar a resposta da API
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Erro HTTP: ${response.status}` }));
    throw new Error(errorData.message || 'Ocorreu um erro desconhecido');
  }
  // Para respostas 204 No Content
  if (response.status === 204) {
    return null as T;
  }
  const result: ApiResponse<T> = await response.json();
  if (!result.success) {
    throw new Error(result.message || 'A API retornou um erro');
  }
  return result.data;
}

class UserService {
  /**
   * Obtém estatísticas de usuários
   */
  async getStats(): Promise<UserStats> {
    console.log('📊 [UserService] Obtendo estatísticas de usuários');
    const response = await apiGet(API_ROUTES.USERS.STATS);
    return handleApiResponse(response);
  }

  /**
   * Lista usuários com filtros e paginação
   */
  async getUsers(filters: UserFilters = {}): Promise<PaginatedResponse<User>> {
    console.log('📋 [UserService] Listando usuários com filtros:', filters);
    const params = new URLSearchParams(filters as any).toString();
    const response = await apiGet(`${API_ROUTES.USERS.BASE}?${params}`);
    // A resposta paginada pode ter um formato diferente
    const result = await response.json();
    if (!result.success) {
        throw new Error(result.message || 'Erro ao listar usuários');
    }
    return {
        items: result.items,
        pagination: result.pagination
    };
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(id: string | number): Promise<User> {
    console.log('🔍 [UserService] Buscando usuário por ID:', id);
    const response = await apiGet(API_ROUTES.USERS.BY_ID(id));
    return handleApiResponse(response);
  }

  /**
   * Obtém perfil do usuário atual
   */
  async getCurrentUser(): Promise<User> {
    console.log('👤 [UserService] Obtendo perfil do usuário atual');
    const response = await apiGet(API_ROUTES.USERS.ME);
    return handleApiResponse(response);
  }

  /**
   * Atualiza perfil do usuário atual
   */
  async updateCurrentUser(data: Partial<UpdateUserData>): Promise<User> {
    console.log('📝 [UserService] Atualizando perfil do usuário atual');
    const response = await apiPut(API_ROUTES.USERS.ME, data);
    return handleApiResponse(response);
  }

  /**
   * Cria novo usuário
   */
  async createUser(data: CreateUserData): Promise<User> {
    console.log('🆕 [UserService] Criando usuário:', data.email);
    const response = await apiPost(API_ROUTES.USERS.BASE, data);
    return handleApiResponse(response);
  }

  /**
   * Atualiza usuário
   */
  async updateUser(id: string | number, data: UpdateUserData): Promise<User> {
    console.log('📝 [UserService] Atualizando usuário:', id);
    const response = await apiPut(API_ROUTES.USERS.BY_ID(id), data);
    return handleApiResponse(response);
  }

  /**
   * Remove usuário
   */
  async deleteUser(id: string | number): Promise<void> {
    console.log('🗑️ [UserService] Removendo usuário:', id);
    const response = await apiDelete(API_ROUTES.USERS.BY_ID(id));
    await handleApiResponse(response);
  }

  /**
   * Ativa usuário
   */
  async activateUser(id: string | number): Promise<void> {
    console.log('🔓 [UserService] Ativando usuário:', id);
    const response = await apiPost(API_ROUTES.USERS.ACTIVATE(id));
    await handleApiResponse(response);
  }

  /**
   * Desativa usuário
   */
  async deactivateUser(id: string | number): Promise<void> {
    console.log('🔒 [UserService] Desativando usuário:', id);
    const response = await apiPost(API_ROUTES.USERS.DEACTIVATE(id));
    await handleApiResponse(response);
  }

  /**
   * Reseta senha do usuário
   */
  async resetPassword(id: string | number): Promise<void> {
    console.log('🔑 [UserService] Resetando senha do usuário:', id);
    const response = await apiPost(API_ROUTES.USERS.RESET_PASSWORD(id));
    await handleApiResponse(response);
  }

  /**
   * Pesquisa usuários
   */
  async searchUsers(query: string, filters: Partial<UserFilters> = {}): Promise<PaginatedResponse<User>> {
    console.log('🔍 [UserService] Pesquisando usuários:', query);
    const params = new URLSearchParams({ ...filters, q: query } as any).toString();
    const response = await apiGet(`${API_ROUTES.USERS.SEARCH}?${params}`);
    const result = await response.json();
    if (!result.success) {
        throw new Error(result.message || 'Erro na pesquisa');
    }
    return {
        items: result.items,
        pagination: result.pagination
    };
  }

  /**
   * Busca usuários por role
   */
  async getUsersByRole(roleId: string): Promise<User[]> {
    console.log('🔍 [UserService] Buscando usuários por role:', roleId);
    const response = await apiGet(API_ROUTES.USERS.BY_ROLE(roleId));
    return handleApiResponse(response);
  }

  /**
   * Busca usuários por instituição
   */
  async getUsersByInstitution(institutionId: number): Promise<User[]> {
    console.log('🔍 [UserService] Buscando usuários por instituição:', institutionId);
    const response = await apiGet(API_ROUTES.USERS.BY_INSTITUTION(institutionId));
    return handleApiResponse(response);
  }
}

// Instância singleton do serviço
export const userService = new UserService();
export default userService;
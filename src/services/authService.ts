import { apiClient, handleApiError, ApiClientError } from '@/lib/api-client';

import { 
  LoginDto, 
  AuthResponseDto, 
  UserResponseDto,
  UserWithRoleDto 
} from '../types/api';
import { User, UserRole } from '../types/auth';

export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export class AuthService {
  private readonly baseEndpoint = '/api/auth';

  /**
   * Realiza login no sistema
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('🔐 AuthService: Iniciando login para:', email);
      const loginData: LoginDto = { email, password };
      
      const response = await apiClient.post<AuthResponseDto>(`${this.baseEndpoint}/login`, loginData);

      if (!response.data) {
        return {
          success: false,
          message: 'Resposta do servidor vazia'
        };
      }

      const responseData = response.data;

      if (!responseData.user || !responseData.token) {
        console.error('❌ AuthService: Resposta de login incompleta:', responseData);
        return {
          success: false,
          message: 'Resposta do servidor incompleta'
        };
      }

      const { user, token } = responseData;

      // Salva o token e dados do usuário
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', token);
      }

      // Converte UserResponseDto para User (compatibilidade)
      const compatibleUser = this.convertToCompatibleUser(user);
      console.log(`✅ AuthService: Usuário convertido com role: "${compatibleUser.role}"`);

      return {
        success: true,
        user: compatibleUser
      };
    } catch (error) {
      console.log('Erro no login:', error);
      
      if (error instanceof ApiClientError) {
        if (error.status === 401) {
          console.error('❌ AuthService: Credenciais inválidas (401)');
          return {
            success: false,
            message: 'Email ou senha incorretos'
          };
        }
        if (error.status === 400) {
          console.error('❌ AuthService: Dados inválidos (400):', error.errors);
          return {
            success: false,
            message: error.errors?.join(', ') || 'Dados inválidos'
          };
        }
      }

      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Registra novo usuário
   */
  async register(
    name: string,
    email: string,
    password: string,
    type: 'student' | 'teacher',
    institutionId?: string
  ): Promise<RegisterResponse> {
    try {
      const roleMapping = {
        'student': 'student-role-id',
        'teacher': 'teacher-role-id'
      };

      const registerData = {
        name,
        email,
        password,
        role_id: roleMapping[type],
        institution_id: institutionId || 'default-institution-id'
      };

      const response = await apiClient.post<AuthResponseDto>(`${this.baseEndpoint}/register`, registerData);

      if (!response.data) {
        return {
          success: false,
          message: 'Resposta do servidor vazia'
        };
      }

      const { user, token } = response.data;

      // Salva o token e dados do usuário
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', token);
      }

      // Converte UserResponseDto para User (compatibilidade)
      const compatibleUser = this.convertToCompatibleUser(user);

      return {
        success: true,
        user: compatibleUser
      };
    } catch (error) {
      console.log('Erro no registro:', error);
      
      if (error instanceof ApiClientError) {
        if (error.status === 409) {
          return {
            success: false,
            message: 'Email já está em uso'
          };
        }
        if (error.status === 400) {
          return {
            success: false,
            message: error.errors?.join(', ') || 'Dados inválidos'
          };
        }
      }

      return {
        success: false,
        message: handleApiError(error)
      };
    }
  }

  /**
   * Obtém usuário atual autenticado
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get<UserWithRoleDto>('/user/me');

      if (!response.data) {
        return null;
      }

      const user = this.convertToCompatibleUser(response.data);
      
      return user;
    } catch (error) {
      console.log('Erro ao buscar usuário atual:', error);
      
      return null;
    }
  }

  /**
   * Realiza logout
   */
  async logout(): Promise<void> {
    try {
      // Tenta fazer logout no servidor
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.log('Erro no logout do servidor:', error);
      // Continua com logout local mesmo se houver erro no servidor
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
      }
    }
  }

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    const token = localStorage.getItem('accessToken');
    return !!token;
  }
  
  /**
   * Altera senha do usuário
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await apiClient.post('/user/me/change-password', {
        currentPassword,
        newPassword
      });

      if (!response.success) {
        throw new Error(response.message || 'Falha ao alterar senha');
      }
    } catch (error) {
      console.log('Erro ao alterar senha:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Solicita recuperação de senha
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });

      if (!response.success) {
        throw new Error(response.message || 'Falha ao solicitar recuperação de senha');
      }
    } catch (error) {
      console.log('Erro ao solicitar recuperação de senha:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Redefine senha com token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        password: newPassword
      });

      if (!response.success) {
        throw new Error(response.message || 'Falha ao redefinir senha');
      }
    } catch (error) {
      console.log('Erro ao redefinir senha:', error);
      throw new Error(handleApiError(error));
    }
  }

  private convertToCompatibleUser(apiUser: UserResponseDto): User {
    return {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      role: UserRole.STUDENT, // Default role

      permissions: [],

      institutionId: apiUser.institution_id,
      createdAt: apiUser.created_at,
      updatedAt: apiUser.updated_at
    };
  }
}

// Instância do serviço
const authService = new AuthService();

// Exporta funções do serviço
export const login = (email: string, password: string) => authService.login(email, password);
export const register = (name: string, email: string, password: string, type: 'student' | 'teacher') => 
  authService.register(name, email, password, type);
export const getCurrentUser = () => authService.getCurrentUser();
export const logout = () => authService.logout();
export const isAuthenticated = () => authService.isAuthenticated();

/**
 * Obtém o token de autenticação do localStorage
 * Função utilitária para compatibilidade com outros serviços
 */
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

// Funções de gerenciamento de usuários (mantidas para compatibilidade)
export const listUsers = async (): Promise<User[]> => {
  try {
    const { userService } = await import('./userService');
    const result = await userService.getUsers();
    return result.items.map(user => authService['convertToCompatibleUser'](user as any));
  } catch (error) {
    console.log('Erro ao listar usuários:', error);
    return [];
  }
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  try {
    const { userService } = await import('./userService');
    
    // Mapear role para role_id - seria melhor buscar roles reais da API
    const roleMapping: Record<UserRole, string> = {
      'STUDENT': 'student-role-id',
      'TEACHER': 'teacher-role-id', 
      'SYSTEM_ADMIN': 'admin-role-id',
      'INSTITUTION_MANAGER': 'manager-role-id',
      'COORDINATOR': 'academic-coordinator-role-id',
      'GUARDIAN': 'guardian-role-id'
    };

    const createData = {
      email: userData.email,
      password: 'temp123', // Senha temporária
      name: userData.name,
      role_id: (userData.role && roleMapping[userData.role as UserRole]) || roleMapping[UserRole.STUDENT],
      institution_id: userData.institution_id,
      endereco: userData.endereco,
      telefone: userData.telefone,
      school_id: userData.school_id,
      is_active: userData.is_active ?? true
    };
    
    const result = await userService.createUser(createData as any);
    return authService['convertToCompatibleUser'](result as any);
  } catch (error) {
    console.log('Erro ao criar usuário:', error);
    throw error;
  }
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
  try {
    const { userService } = await import('./userService');
    
    // Mapear role para role_id se fornecido
    let role_id: string | undefined;
    if (userData.role) {
      const roleMapping: Record<UserRole, string> = {
        'STUDENT': 'student-role-id',
        'TEACHER': 'teacher-role-id', 
        'INSTITUTION_MANAGER': 'manager-role-id',
        'SYSTEM_ADMIN': 'system-admin-role-id',
        'COORDINATOR': 'academic-coordinator-role-id',
        'GUARDIAN': 'guardian-role-id'
      };
      role_id = roleMapping[userData.role];
    }

    const updateData = {
      email: userData.email,
      name: userData.name,
      role_id: role_id,
      institution_id: userData.institution_id,
      endereco: userData.endereco,
      telefone: userData.telefone,
      school_id: userData.school_id,
      is_active: userData.is_active
    };
    
    const result = await userService.updateUser(id, updateData as any);
    return result ? authService['convertToCompatibleUser'](result as any) : null;
  } catch (error) {
    console.log('Erro ao atualizar usuário:', error);
    return null;
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const { userService } = await import('./userService');
    await userService.deleteUser(id);
    return true;
  } catch (error) {
    console.log('Erro ao deletar usuário:', error);
    return false;
  }
};

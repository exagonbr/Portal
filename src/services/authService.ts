import { apiClient, handleApiError, ApiClientError, isAuthError } from '@/lib/api-client';
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
  private readonly baseEndpoint = '/auth';

  /**
   * Realiza login no sistema
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const loginData: LoginDto = { email, password };
      
      const response = await apiClient.post<AuthResponseDto>(`${this.baseEndpoint}/login`, loginData);

      if (!response.success || !response.data) {
        return {
          success: false,
          message: response.message || 'Falha na autenticação'
        };
      }

      const { user, accessToken } = response.data;

      // Salva o token e dados do usuário
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
      }

      // Converte UserResponseDto para User (compatibilidade)
      const compatibleUser = this.convertToCompatibleUser(user);

      return {
        success: true,
        user: compatibleUser
      };
    } catch (error) {
      console.log('Erro no login:', error);
      
      if (error instanceof ApiClientError) {
        if (error.status === 401) {
          return {
            success: false,
            message: 'Email ou senha incorretos'
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
      // Para registro, precisamos mapear o tipo para role_id
      // Isso pode ser melhorado com um endpoint para buscar roles
      const roleMapping = {
        'student': 'student-role-id', // Substituir pelos IDs reais
        'teacher': 'teacher-role-id'
      };

      const registerData = {
        name,
        email,
        password,
        role_id: roleMapping[type],
        institution_id: institutionId || 'default-institution-id' // Substituir por ID real
      };

      const response = await apiClient.post<AuthResponseDto>(`${this.baseEndpoint}/register`, registerData);

      if (!response.success || !response.data) {
        return {
          success: false,
          message: response.message || 'Falha no registro'
        };
      }

      const { user, accessToken } = response.data;

      // Salva o token e dados do usuário
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
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

      if (!response.success || !response.data) {
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
    // Mapear role_id para role baseado no UserWithRoleDto se disponível
    let role: UserRole = 'student'; // default
    if ('role_name' in apiUser) {
      const roleMapping: Record<string, UserRole> = {
        'Aluno': 'student',
        'Professor': 'teacher',
        'Gestor': 'manager',
        'Administrador': 'admin',
        'Coordenador Acadêmico': 'academic_coordinator',
        'Responsável': 'guardian'
      };
      role = roleMapping[(apiUser as UserWithRoleDto).role_name] || 'student';
    }

    return {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      role: role,
      endereco: apiUser.endereco,
      telefone: apiUser.telefone,
      institution_id: apiUser.institution_id,
      school_id: apiUser.school_id,
      is_active: apiUser.is_active,
      created_at: new Date(apiUser.created_at),
      updated_at: new Date(apiUser.updated_at),
      courses: [] // Será preenchido quando necessário
    };
  }
}

// Instância singleton do serviço de autenticação
export const authService = new AuthService();

// Funções de conveniência para compatibilidade com código existente
export const login = (email: string, password: string) => authService.login(email, password);
export const register = (name: string, email: string, password: string, type: 'student' | 'teacher') => 
  authService.register(name, email, password, type);
export const getCurrentUser = () => authService.getCurrentUser();
export const logout = () => authService.logout();
export const isAuthenticated = () => authService.isAuthenticated();

// Funções de gerenciamento de usuários (mantidas para compatibilidade)
export const listUsers = async (): Promise<User[]> => {
  try {
    const { userService } = await import('./userService');
    const result = await userService.getUsers();
    return result.items.map(user => authService['convertToCompatibleUser'](user));
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
      'student': 'student-role-id',
      'teacher': 'teacher-role-id', 
      'admin': 'admin-role-id',
      'manager': 'manager-role-id',
      'system_admin': 'system-admin-role-id',
      'institution_manager': 'institution-manager-role-id',
      'academic_coordinator': 'academic-coordinator-role-id',
      'guardian': 'guardian-role-id'
    };

    const createData = {
      email: userData.email,
      password: 'temp123', // Senha temporária
      name: userData.name,
      role_id: (userData.role && roleMapping[userData.role as UserRole]) || roleMapping['student'],
      institution_id: userData.institution_id,
      endereco: userData.endereco,
      telefone: userData.telefone,
      school_id: userData.school_id,
      is_active: userData.is_active ?? true
    };
    
    const result = await userService.createUser(createData);
    return authService['convertToCompatibleUser'](result);
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
        'student': 'student-role-id',
        'teacher': 'teacher-role-id', 
        'admin': 'admin-role-id',
        'manager': 'manager-role-id',
        'system_admin': 'system-admin-role-id',
        'institution_manager': 'institution-manager-role-id',
        'academic_coordinator': 'academic-coordinator-role-id',
        'guardian': 'guardian-role-id'
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
    
    const result = await userService.updateUser(createData);
    return result ? authService['convertToCompatibleUser'](result) : null;
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
import { apiClient, handleApiError, ApiClientError, isAuthError } from './apiClient';
import { 
  LoginDto, 
  AuthResponseDto, 
  UserResponseDto,
  UserWithRoleDto 
} from '../types/api';
import { User, UserRole, UserEssentials } from '../types/auth';

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: UserEssentials;
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
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const loginData: LoginDto = { email, password };
      
      const response = await apiClient.post<AuthResponseDto>(`${this.baseEndpoint}/login`, loginData);

      // Verifica se a resposta tem o formato esperado
<<<<<<< HEAD
      // Extrair dados diretamente da resposta, seja dentro de data ou na raiz
      const responseData = response.data || response;

      // Verifica se os dados essenciais existem
      // Usamos type assertion para acessar as propriedades, já que a estrutura pode variar
      const respData = responseData as any;
      const user = respData.user;
      const token = respData.token;
      const sessionId = respData.sessionId || '';
      const expiresAt = respData.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      if (!user || !token) {
        console.error('Resposta de login incompleta:', responseData);
=======
      const responseData = (response.data || response) as AuthResponseDto;

      if (!responseData.user || !responseData.token) {
>>>>>>> 2d85e2b6d52603d50528b369453e0382e6816aae
        return {
          success: false,
          message: 'Resposta do servidor incompleta'
        };
      }

      // Salva o token e dados do usuário
      this.saveAuthData(
<<<<<<< HEAD
        token,
        sessionId,
        user,
        expiresAt
=======
        responseData.token,
        responseData.sessionId || '',
        responseData.user,
        responseData.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
>>>>>>> 2d85e2b6d52603d50528b369453e0382e6816aae
      );

      // Converte UserResponseDto para User (compatibilidade)
      const compatibleUser = this.convertToCompatibleUser(responseData.user);

      return {
        success: true,
        user: compatibleUser
      };
    } catch (error) {
      console.error('Erro no login:', error);
      
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

      if (!response.success || !response.data) {
        return {
          success: false,
          message: response.message || 'Falha no registro'
        };
      }

      const { user, token, sessionId, expires_at } = response.data;

      if (!user || !token || !sessionId || !expires_at) {
        return {
          success: false,
          message: 'Resposta do servidor incompleta'
        };
      }

      // Salva o token e dados do usuário
      this.saveAuthData(token, sessionId, user, expires_at);

      // Converte UserResponseDto para User (compatibilidade)
      const compatibleUser = this.convertToCompatibleUser(user);

      return {
        success: true,
        user: compatibleUser
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      
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
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      // Verifica se há token válido
      if (!this.isAuthenticated()) {
        return {
          success: false,
          message: 'Usuário não autenticado'
        };
      }

      const response = await apiClient.get<UserWithRoleDto>('/api/users/me');

      if (!response.success || !response.data) {
        // Token pode estar expirado, limpa dados
        this.clearAuthData();
        return {
          success: false,
          message: 'Erro ao buscar usuário'
        };
      }

      const user = this.convertToCompatibleUser(response.data);
      
      // Atualiza dados do usuário no storage
      this.saveUserData(user);

      return {
        success: true,
        user: user
      };
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      
      // Se for erro de autenticação, limpa dados
      if (isAuthError(error)) {
        this.clearAuthData();
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao buscar usuário'
      };
    }
  }

  /**
   * Realiza logout
   */
  async logout(): Promise<AuthResponse> {
    try {
      // Tenta fazer logout no servidor
      await apiClient.post('/auth/logout');
      this.clearAuthData();
      return {
        success: true,
      };
    } catch (error) {
      console.error('Erro no logout do servidor:', error);
      // Continua com logout local mesmo se houver erro no servidor
      this.clearAuthData();
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao fazer logout'
      };
    }
  }

  /**
   * Verifica se usuário está autenticado
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;

    const token = this.getStoredToken();
    if (!token) return false;

    // Verifica se token não expirou
    const expiresAt = localStorage.getItem('auth_expires_at');
    if (expiresAt) {
      const expirationDate = new Date(expiresAt);
      if (expirationDate <= new Date()) {
        this.clearAuthData();
        return false;
      }
    }

    return true;
  }

  /**
   * Salva dados de autenticação
   */
  private saveAuthData(token: string, refreshToken: string, user: UserResponseDto, expiresAt: string): void {
    if (typeof window === 'undefined') return;

    // Salva tokens
    apiClient.setAuthToken(token, refreshToken, expiresAt);

    // Salva dados do usuário
    this.saveUserData(this.convertToCompatibleUser(user));
  }

  /**
   * Salva dados do usuário
   */
  private saveUserData(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user_data', JSON.stringify(user));
  }

  /**
   * Limpa dados de autenticação
   */
  private clearAuthData(): void {
    if (typeof window === 'undefined') return;
    
    apiClient.clearAuth();
    localStorage.removeItem('user_data');
  }

  /**
   * Obtém token armazenado
   */
  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  /**
   * Converte UserResponseDto para User
   */
  private convertToCompatibleUser(apiUser: UserResponseDto): User {
    return {
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      role: apiUser.role?.name?.toLowerCase() as UserRole || 'student',
      permissions: apiUser.role?.permissions || [],
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

// Funções de gerenciamento de usuários (mantidas para compatibilidade)
export const listUsers = async (): Promise<User[]> => {
  try {
    const { userService } = await import('./userService');
    const result = await userService.getUsers();
    return result.items.map(user => authService['convertToCompatibleUser'](user));
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
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
    console.error('Erro ao criar usuário:', error);
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
    
    const result = await userService.updateUser(id, updateData);
    return result ? authService['convertToCompatibleUser'](result) : null;
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return null;
  }
};

export const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const { userService } = await import('./userService');
    await userService.deleteUser(id);
    return true;
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return false;
  }
};
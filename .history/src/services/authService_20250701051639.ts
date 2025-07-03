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

      const { user, token, expires_at } = response.data;

      // Salva o token e dados do usuário
      this.saveAuthData(token, user, expires_at);

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

      const { user, token, expires_at } = response.data;

      // Salva o token e dados do usuário
      this.saveAuthData(token, user, expires_at);

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
      // Verifica se há token válido
      if (!this.isAuthenticated()) {
        return null;
      }

      const response = await apiClient.get<UserWithRoleDto>('/user/me');

      if (!response.success || !response.data) {
        // Token pode estar expirado, limpa dados
        this.clearAuthData();
        return null;
      }

      const user = this.convertToCompatibleUser(response.data);
      
      // Atualiza dados do usuário no storage
      this.saveUserData(user);

      return user;
    } catch (error) {
      console.log('Erro ao buscar usuário atual:', error);
      
      // Se for erro de autenticação, limpa dados
      if (isAuthError(error)) {
        this.clearAuthData();
      }

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
      // Sempre limpa dados locais
      this.clearAuthData();
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
    if (this.isTokenExpired()) {
      return false;
    }

    return true;
  }
  
  /**
   * Verifica se o token está expirado
   */
  isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true;
    
    const token = this.getStoredToken();
    if (!token) return true;
    
    // Verificar data de expiração no localStorage
    const expiresAt = localStorage.getItem('auth_expires_at');
    if (expiresAt) {
      const expirationDate = new Date(expiresAt);
      if (expirationDate <= new Date()) {
        return true;
      }
      
      // Verificar se está próximo de expirar (menos de 5 minutos)
      const fiveMinutes = 5 * 60 * 1000;
      if (expirationDate.getTime() - Date.now() < fiveMinutes) {
        return true; // Considera expirado se faltar menos de 5 minutos
      }
    } else {
      // Se não tiver data de expiração, tenta decodificar o token
      try {
        // Decodificar JWT (sem verificação de assinatura)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const { exp } = JSON.parse(jsonPayload);
        
        if (exp) {
          const expDate = new Date(exp * 1000);
          return expDate <= new Date();
        }
      } catch (error) {
        console.log('Erro ao decodificar token:', error);
      }
    }
    
    return false;
  }

  /**
   * Atualiza token de autenticação
   */
  async refreshToken(): Promise<boolean> {
    try {
      console.log('Tentando renovar token de autenticação...');
      
      // Verifica se temos um refresh token
      let refreshToken = null;
      
      if (typeof window !== 'undefined') {
        // Tenta obter do cookie
        refreshToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('refresh_token='))
          ?.split('=')[1];
      }
      
      if (!refreshToken) {
        console.warn('Refresh token não encontrado, não é possível renovar a sessão');
        return false;
      }
      
      // Evitar loop infinito - verificar se já tentou refresh recentemente
      const lastRefreshAttempt = localStorage.getItem('last_refresh_attempt');
      const now = Date.now();
      
      if (lastRefreshAttempt) {
        const timeSinceLastAttempt = now - parseInt(lastRefreshAttempt);
        if (timeSinceLastAttempt < 10000) { // 10 segundos
          console.warn('Muitas tentativas de refresh em curto período, aguardando...');
          return false;
        }
      }
      
      // Marcar tentativa de refresh
      localStorage.setItem('last_refresh_attempt', now.toString());
      
      // Chamar endpoint específico para refresh
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        credentials: 'include',
      });

      if (!response.ok) {
        console.log('Erro na resposta do refresh token:', response.status);
        if (response.status === 401) {
          this.clearAuthData();
        }
        return false;
      }

      const data = await response.json();
      
      if (!data.success) {
        console.log('Falha no refresh token:', data.message);
        this.clearAuthData();
        return false;
      }

      // Atualiza token no apiClient para futuras requisições
      const { token } = data.data;
      apiClient.setAuthToken(token);
      
      console.log('Token renovado com sucesso');
      return true;
    } catch (error) {
      console.log('Erro ao renovar token:', error);
      // Não limpar dados em caso de erro de rede
      if (error instanceof Error && error.message.includes('fetch failed')) {
        console.warn('Erro de rede ao renovar token, tentando manter sessão atual');
        return true;
      }
      this.clearAuthData();
      return false;
    }
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

  // Métodos privados para gerenciamento de dados

  private saveAuthData(token: string, user: UserResponseDto, expiresAt: string): void {
    if (typeof window === 'undefined') return;

    // Salva token
    apiClient.setAuthToken(token);
    
    // Salva dados adicionais
    localStorage.setItem('auth_expires_at', expiresAt);
    
    // Salva dados do usuário
    const compatibleUser = this.convertToCompatibleUser(user);
    this.saveUserData(compatibleUser);
  }

  private saveUserData(user: User): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem('user', JSON.stringify(user));
    
    // Também salva em cookie para SSR
    const expires = new Date();
    expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias
    document.cookie = `user_data=${encodeURIComponent(JSON.stringify(user))};expires=${expires.toUTCString()};path=/;secure;samesite=strict`;
  }

  private clearAuthData(): void {
    if (typeof window === 'undefined') return;

    // Limpa API client
    apiClient.clearAuth();
    
    // Limpa localStorage
    localStorage.removeItem('auth_expires_at');
    localStorage.removeItem('user');
    localStorage.removeItem('session_id');
    
    // Limpa cookies
    const cookiesToClear = ['auth_token', 'user_data', 'session_id'];
    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
    });
  }

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;

    // Tenta localStorage primeiro
    const token = localStorage.getItem('auth_token');
    if (token) return token;

    // Fallback para cookies
    const cookieToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('auth_token='))
      ?.split('=')[1];

    return cookieToken || null;
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
export const isTokenExpired = () => authService.isTokenExpired();
export const refreshToken = () => authService.refreshToken();

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
    
    const result = await userService.updateUser(id, updateData);
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
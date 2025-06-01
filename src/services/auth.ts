import { apiService } from './api';
import { UserEssentials, Permission } from '@/types/auth';

export interface User {
  id: string;
  name: string;
  email: string;
  role_name: string;
  institution_id?: string;
  institution_name?: string;
  is_active: boolean;
  profile_picture?: string;
  phone?: string;
}

export interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: UserEssentials;
  };
  user?: UserEssentials;
  message?: string;
  error?: string;
}

export interface RegisterResponse {
  success: boolean;
  message?: string;
  error?: string;
}

class AuthService {
  private user: User | null = null;

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiService.login(email, password);
      
      if (response.success && response.data && typeof response.data === 'object') {
        const data = response.data as any;
        if (data.token && data.user) {
          const { token, user } = data;
          
          // Armazenar token
          apiService.setAuthToken(token);
          
          // Armazenar usuário
          this.user = user as User;
          localStorage.setItem('user', JSON.stringify(user));
          
          const userEssentials = this.convertToUserEssentials(user as User);
          
          return {
            success: true,
            data: { token, user: userEssentials },
            user: userEssentials
          };
        }
      }
      
      return {
        success: false,
        error: response.error || 'Erro no login'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro de conexão'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Limpar dados locais
      this.user = null;
      apiService.removeAuthToken();
      localStorage.removeItem('user');
    }
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role_id: string;
    institution_id: string;
    phone?: string;
  }): Promise<LoginResponse> {
    try {
      const response = await apiService.register(userData);
      
      if (response.success) {
        // Após registro bem-sucedido, fazer login automático para obter o usuário
        const loginResponse = await this.login(userData.email, userData.password);
        return loginResponse;
      }
      
      return {
        success: false,
        error: response.error || 'Erro no registro'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro de conexão'
      };
    }
  }

  async getCurrentUser(): Promise<UserEssentials | null> {
    // Verificar se já temos o usuário em memória
    if (this.user) {
      return this.convertToUserEssentials(this.user);
    }

    // Verificar se há usuário no localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        this.user = JSON.parse(storedUser) as User;
        return this.convertToUserEssentials(this.user);
      } catch (error) {
        console.error('Erro ao parsing do usuário armazenado:', error);
      }
    }

    // Buscar usuário atual da API
    try {
      const response = await apiService.getProfile();
      if (response.success && response.data) {
        this.user = response.data as User;
        localStorage.setItem('user', JSON.stringify(this.user));
        return this.convertToUserEssentials(this.user);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
    }

    return null;
  }

  // Função auxiliar para converter User para UserEssentials
  private convertToUserEssentials(user: User): UserEssentials {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role_name as any, // Conversão de role_name para role
      permissions: [] // Adicionar lógica para mapear permissões se necessário
    };
  }

  async updateProfile(userData: Partial<User>): Promise<{ success: boolean; error?: string }> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        return { success: false, error: 'Usuário não autenticado' };
      }

      const response = await apiService.updateUser(currentUser.id, userData);
      
      if (response.success && response.data) {
        this.user = response.data as User;
        localStorage.setItem('user', JSON.stringify(this.user));
        return { success: true };
      }
      
      return {
        success: false,
        error: response.error || 'Erro ao atualizar perfil'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Erro de conexão'
      };
    }
  }

  isAuthenticated(): boolean {
    const token = apiService.getAuthToken();
    return !!token;
  }

  hasRole(role: string): boolean {
    return this.user?.role_name === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return this.user?.role_name ? roles.includes(this.user.role_name) : false;
  }

  getUserInstitutionId(): string | null {
    return this.user?.institution_id || null;
  }

  // Método para validar se o token ainda é válido
  async validateToken(): Promise<boolean> {
    try {
      const response = await apiService.getProfile();
      return response.success;
    } catch (error) {
      return false;
    }
  }
}

export const authService = new AuthService();

// Funções legadas para compatibilidade
export const login = authService.login.bind(authService);
export const logout = authService.logout.bind(authService);
export const getCurrentUser = authService.getCurrentUser.bind(authService);

// Wrapper para register que aceita a assinatura esperada pelo AuthContext
export const register = (name: string, email: string, password: string, type: 'student' | 'teacher') => {
  // Mapear tipo para role_id (você pode ajustar esses IDs conforme necessário)
  const roleMapping = {
    'student': 'student-role-id',
    'teacher': 'teacher-role-id'
  };
  
  return authService.register({
    name,
    email,
    password,
    role_id: roleMapping[type],
    institution_id: 'default-institution-id' // Ajuste conforme necessário
  });
};

export default authService; 
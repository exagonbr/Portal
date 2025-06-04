import { apiClient, handleApiError, ApiClientError, isAuthError } from './apiClient';
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

/**
 * Serviço responsável pela autenticação do usuário
 */
export class AuthService {
  private readonly baseEndpoint = '/api/auth';
  private roleCache: Map<string, string> = new Map(); // Cache role name -> role ID

  /**
   * Busca o mapeamento real de roles da API
   */
  private async getRoleMapping(): Promise<Record<string, string>> {
    try {
      // Se já temos cache, retorna
      if (this.roleCache.size > 0) {
        return Object.fromEntries(this.roleCache);
      }

      console.log('🔍 AuthService: Buscando roles da API...');
      
      // Busca roles da API
      const response = await apiClient.get<{roles: Array<{id: string, name: string}>}>('/api/roles');
      
      if (!response.success || !response.data?.roles) {
        console.warn('⚠️ AuthService: Falha ao buscar roles, usando fallback');
        return this.getFallbackRoleMapping();
      }

      // Cria mapeamento name -> id
      const mapping: Record<string, string> = {};
      response.data.roles.forEach(role => {
        const normalizedName = this.normalizeRoleName(role.name);
        mapping[normalizedName] = role.id;
        this.roleCache.set(normalizedName, role.id);
      });

      console.log('✅ AuthService: Mapeamento de roles carregado:', mapping);
      return mapping;
    } catch (error) {
      console.error('❌ AuthService: Erro ao buscar roles da API:', error);
      return this.getFallbackRoleMapping();
    }
  }

  /**
   * Normaliza nome da role para mapeamento consistente
   */
  private normalizeRoleName(roleName: string): string {
    const nameMap: Record<string, string> = {
      'STUDENT': 'student',
      'TEACHER': 'teacher',
      'SYSTEM_ADMIN': 'system_admin',
      'ADMIN': 'admin',
      'INSTITUTION_MANAGER': 'institution_manager',
      'MANAGER': 'manager',
      'ACADEMIC_COORDINATOR': 'academic_coordinator',
      'COORDINATOR': 'academic_coordinator',
      'GUARDIAN': 'guardian',
      'RESPONSAVEL': 'guardian'
    };

    const upperName = roleName.toUpperCase();
    return nameMap[upperName] || roleName.toLowerCase();
  }

  /**
   * Mapeamento de fallback caso a API não esteja disponível
   */
  private getFallbackRoleMapping(): Record<string, string> {
    console.warn('⚠️ AuthService: Usando mapeamento de fallback para roles');
    return {
      'student': 'fallback-student-id',
      'teacher': 'fallback-teacher-id',
      'admin': 'fallback-admin-id',
      'manager': 'fallback-manager-id',
      'system_admin': 'fallback-system-admin-id',
      'institution_manager': 'fallback-institution-manager-id',
      'academic_coordinator': 'fallback-coordinator-id',
      'guardian': 'fallback-guardian-id'
    };
  }

  /**
   * Obtém role_id para uma role específica
   */
  public async getRoleId(roleName: UserRole): Promise<string> {
    const mapping = await this.getRoleMapping();
    const roleId = mapping[roleName];
    
    if (!roleId) {
      console.warn(`⚠️ AuthService: Role '${roleName}' não encontrada no mapeamento`);
      return `unknown-${roleName}-id`;
    }
    
    return roleId;
  }

  /**
   * Realiza login no sistema
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('🔐 AuthService: Iniciando login para:', email);
      const loginData: LoginDto = { email, password };
      
      const response = await apiClient.post<AuthResponseDto>(`${this.baseEndpoint}/login`, loginData);

      // Verifica se a resposta tem o formato esperado
      const responseData = (response.data || response) as AuthResponseDto;

      if (!responseData.user || !responseData.token) {
        console.error('❌ AuthService: Resposta de login incompleta:', responseData);
        return {
          success: false,
          message: 'Resposta do servidor incompleta'
        };
      }

      console.log('✅ AuthService: Login bem-sucedido, salvando dados do usuário');
      console.log(`🔍 AuthService: Role recebida do backend: "${responseData.user.role}"`);

      // Salva o token e dados do usuário
      this.saveAuthData(
        responseData.token,
        responseData.sessionId || '',
        responseData.user,
        responseData.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      );

      // Converte UserResponseDto para User (compatibilidade)
      const compatibleUser = this.convertToCompatibleUser(responseData.user);
      console.log(`✅ AuthService: Usuário convertido com role: "${compatibleUser.role}"`);
      
      // Log das permissões recebidas
      if (compatibleUser.permissions && compatibleUser.permissions.length > 0) {
        console.log(`✅ AuthService: Permissões recebidas: ${compatibleUser.permissions.join(', ')}`);
      } else {
        console.warn('⚠️ AuthService: Nenhuma permissão recebida do backend');
      }

      return {
        success: true,
        user: compatibleUser
      };
    } catch (error: any) {
      console.error('❌ AuthService: Erro no login:', error);
      
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
  async getCurrentUser(): Promise<User | null> {
    try {
      // Verifica se há token válido
      const token = this.getStoredToken();
      if (!token) {
        console.warn('❌ AuthService: Token não encontrado');
        return null;
      }

      const response = await apiClient.get<UserWithRoleDto>('/api/auth/me');

      if (!response.success || !response.data) {
        console.error('❌ AuthService: Resposta inválida do servidor');
        this.clearAuthData();
        return null;
      }

      const user = this.convertToCompatibleUser(response.data);
      
      // Atualiza dados do usuário no storage
      this.saveUserData(user);
      console.log('✅ AuthService: Dados do usuário atualizados com sucesso');

      return user;
    } catch (error) {
      console.error('❌ AuthService: Erro ao buscar usuário atual:', error);
      
      // Se for erro de autenticação, limpa dados
      if (isAuthError(error)) {
        console.warn('❌ AuthService: Erro de autenticação, limpando dados');
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
      console.error('Erro no logout do servidor:', error);
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
   * Obtém as permissões do usuário a partir do payload do token
   */
  private getPermissionsFromToken(token: string): string[] {
    try {
      // Decodifica o token JWT (sem verificar a assinatura)
      const payloadBase64 = token.split('.')[1];
      const payload = JSON.parse(atob(payloadBase64));
      
      // Extrai permissões do payload
      const permissions = payload.permissions || [];
      
      console.log(`🔐 AuthService: Permissões extraídas do token: ${permissions.join(', ')}`);
      return permissions;
    } catch (error) {
      console.error('❌ AuthService: Erro ao extrair permissões do token:', error);
      return [];
    }
  }

  /**
   * Converte dados do usuário da API para o formato interno
   */
  private convertToCompatibleUser(userDto: UserResponseDto): User {
    // Extrai informações de role
    const roleName = userDto.role?.name || 'student'; // Fallback para student
    const permissions = userDto.role?.permissions || [];
    
    // Mapeamento de roles em português para inglês
    const roleMapping: Record<string, UserRole> = {
      'aluno': 'student',
      'professor': 'teacher',
      'administrador': 'system_admin',
      'gestor': 'institution_manager',
      'coordenador': 'academic_coordinator',
      'responsável': 'guardian'
    };

    // Determina a role (normalizada)
    const normalizedRole = (roleMapping[roleName.toLowerCase()] || 
                           roleName.toLowerCase()) as UserRole;

    // Cria o objeto de usuário compatível
    const user: User = {
      id: userDto.id,
      name: userDto.name,
      email: userDto.email,
      role: normalizedRole,
      permissions: permissions,
      institution_id: userDto.institution_id
    };

    return user;
  }

  /**
   * Salva dados de autenticação
   */
  private saveAuthData(
    token: string, 
    sessionId: string, 
    user: UserResponseDto,
    expiresAt: string
  ): void {
    // Salva token nos cookies
    this.setCookie('auth_token', token, 1); // 1 dia
    
    // Salva ID de sessão
    this.setCookie('session_id', sessionId, 1);
    
    // Extrai permissões do token
    const permissions = this.getPermissionsFromToken(token);
    
    // Converte dados do usuário
    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role?.name || 'unknown',
      permissions: permissions.length > 0 ? permissions : user.role?.permissions || []
    };
    
    // Salva dados do usuário em cookie para acesso pelo middleware
    this.setCookie('user_data', JSON.stringify(userData), 1);
    
    // Salva dados no localStorage para persistência
    localStorage.setItem('auth_token', token);
    localStorage.setItem('session_id', sessionId);
    localStorage.setItem('user_data', JSON.stringify(userData));
    localStorage.setItem('expires_at', expiresAt);
  }

  /**
   * Define um cookie
   */
  private setCookie(name: string, value: string, days: number): void {
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${encodeURIComponent(value)};path=/;max-age=${maxAge};SameSite=Lax`;
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
}

// Instância do serviço
const authService = new AuthService();

// Exporta a instância
export { authService };

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
    return result.users.map((user: any) => authService['convertToCompatibleUser']({
      ...user,
      created_at: user.created_at || new Date().toISOString(),
      updated_at: user.updated_at || new Date().toISOString()
    }));
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    return [];
  }
};

export const createUser = async (userData: Omit<User, 'id'>): Promise<User> => {
  try {
    const { userService } = await import('./userService');
    
    // Busca role_id real da API
    const roleId = userData.role ? await authService.getRoleId(userData.role) : 
                                   await authService.getRoleId('student'); // fallback

    const createData = {
      email: userData.email,
      password: 'temp123', // Senha temporária
      name: userData.name,
      role_id: roleId,
      institution_id: userData.institution_id,
      endereco: userData.endereco,
      telefone: userData.telefone,
      school_id: userData.school_id,
      is_active: userData.is_active ?? true
    };
    
    const result = await userService.createUser(createData);
    return authService['convertToCompatibleUser']({
      ...result,
      role: { name: result.role, permissions: [] },
      created_at: result.createdAt || new Date().toISOString(),
      updated_at: result.updatedAt || new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
};

export const updateUser = async (id: string, userData: Partial<User>): Promise<User | null> => {
  try {
    const { userService } = await import('./userService');
    
    // Busca role_id real da API se fornecido
    let role_id: string | undefined;
    if (userData.role) {
      role_id = await authService.getRoleId(userData.role);
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
    return result ? authService['convertToCompatibleUser']({
      ...result,
      role: { name: result.role, permissions: [] },
      created_at: result.createdAt || new Date().toISOString(),
      updated_at: result.updatedAt || new Date().toISOString()
    }) : null;
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
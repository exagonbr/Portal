/**
 * Define os possíveis papéis de usuário no sistema
 * Importando do arquivo centralizado de roles
 */
import { UserRole } from './roles';
export { UserRole };

/**
 * Define as permissões possíveis no sistema
 */
export type Permission =
  | 'create:user'
  | 'read:user'
  | 'update:user'
  | 'delete:user'
  | 'create:course'
  | 'read:course'
  | 'update:course'
  | 'delete:course'
  | 'manage:institution'
  | 'view:reports'
  | 'manage:students'
  | string; // Permite extensibilidade para permissões adicionais

/**
 * Interface para representar um curso associado ao usuário
 */
export interface UserCourse {
  id: string;
  name: string;
  role?: UserRole; // Papel do usuário neste curso específico
  status?: 'active' | 'completed' | 'pending';
}

/**
 * Interface para representar uma instituição associada ao usuário
 */
export interface UserInstitution {
  id: string;
  name: string;
}

/**
 * Interface para informações de contato do usuário
 */
export interface UserContact {
  address?: string;     // Endereço
  phone?: string;       // Telefone
  educationUnit?: string; // Unidade de ensino
}

/**
 * Interface principal do usuário
 * Contém todas as informações relevantes sobre um usuário autenticado
 */
export interface User {
  // Informações básicas (obrigatórias)
  id: string;
  name: string;
  email: string;
  
  // Informações de acesso e permissões
  role: UserRole;
  permissions?: Permission[];
  
  // Informações institucionais
  institution?: UserInstitution;
  
  // Compatibilidade com versões anteriores
  institution_id?: string;
  institution_name?: string;
  type?: string;
  
  // Cursos associados
  courses?: UserCourse[];
  
  // Informações de contato
  contact?: UserContact;
  
  // Campos legados em português (para compatibilidade)
  // Estes campos devem ser migrados para a estrutura contact acima
  endereco?: string;
  telefone?: string;
  usuario?: string;
  unidadeEnsino?: string;
  
  // Campos adicionais para extensibilidade
  [key: string]: any;
}

/**
 * Interface para dados essenciais do usuário
 * Contém apenas os campos críticos necessários para autenticação e autorização
 */
export interface UserEssentials {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions?: Permission[];
}

/**
 * Interface para o payload do token JWT
 */
export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  permissions?: Permission[];
  exp?: number; // Timestamp de expiração
  iat?: number; // Timestamp de emissão
}

/**
 * Interface para resposta de autenticação bem-sucedida
 */
export interface AuthSuccessResponse {
  success: true;
  user: UserEssentials;
  token: string;
  expiresAt?: number; // Timestamp de expiração do token
}

/**
 * Interface para resposta de autenticação com falha
 */
export interface AuthErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Tipo união para resposta de autenticação (sucesso ou erro)
 */
export type AuthResponse = AuthSuccessResponse | AuthErrorResponse;

/**
 * Interface para requisição de login
 */
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Interface para requisição de registro
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: UserRole;
  institution_id?: string;
}

import { BaseEntity } from '../types/common';

// DTOs de entrada
export interface CreateUserDto {
  email: string;
  full_name: string;
  password?: string;
  username?: string;
  institution_id?: string | null;
  
  // Campos booleanos com valores padrão
  account_expired?: boolean;
  account_locked?: boolean;
  enabled?: boolean;
  is_admin?: boolean;
  is_manager?: boolean;
  is_student?: boolean;
  is_teacher?: boolean;
  
  // Campos opcionais
  address?: string;
  phone?: string;
  language?: string;
  type?: number;
}

export interface UpdateUserDto {
  full_name?: string;
  email?: string;
  password?: string;
  username?: string;
  institution_id?: string | null;
  
  account_expired?: boolean;
  account_locked?: boolean;
  enabled?: boolean;
  is_admin?: boolean;
  is_manager?: boolean;
  is_student?: boolean;
  is_teacher?: boolean;
  
  address?: string;
  phone?: string;
  language?: string;
  type?: number;
  
  // Campos de certificado
  certificate_path?: string;
  is_certified?: boolean;
  
  // Campos de matéria
  subject?: string;
  subject_data_id?: string | null;
}

export interface UpdateProfileDto {
  email?: string;
  name?: string;
  address?: string;
  phone?: string;
  school_id?: number;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// DTOs de saída
export interface UserResponseDto extends BaseEntity {
  id: string; // ou number, dependendo do backend
  version?: number;
  uuid?: string;
  
  // Informações principais
  full_name: string;
  email: string;
  username?: string;
  
  // Status da conta
  account_expired?: boolean;
  account_locked?: boolean;
  enabled?: boolean;
  password_expired?: boolean;
  
  // Detalhes de contato
  address?: string;
  phone?: string;
  
  // Configurações e permissões
  language?: string;
  is_admin: boolean;
  is_manager: boolean;
  is_student: boolean;
  is_teacher: boolean;
  type?: number;
  
  // Relacionamentos
  institution_id?: string | null;
  subject_data_id?: string | null;
  
  // Datas
  date_created?: string;
  last_updated?: string;
  
  // Certificado
  certificate_path?: string;
  is_certified?: boolean;
  
  // Outros
  amount_of_media_entries?: number;
  invitation_sent?: boolean;
  pause_video_on_click?: boolean;
  reset_password?: boolean;
  subject?: string;
}

export interface UserWithRoleDto extends UserResponseDto {
  role_name: string;
  institution_name: string;
}

export interface UserListResponseDto {
  users: UserResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// DTOs de filtro
export interface UserFilterDto {
  search?: string;
  role?: string;
  institution_id?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
  name?: string;
  email?: string;
  role_id?: string;
  is_active?: boolean;
  created_after?: string;
  created_before?: string;
}

// DTOs de validação
export interface UserValidationDto {
  email?: string;
  excludeUserId?: string; // Para excluir o próprio usuário na validação de atualização
}

// DTOs para relacionamentos
export interface UserCourseDto {
  course_id: string;
  course_name: string;
  course_description?: string;
  user_role: 'student' | 'teacher';
  progress?: number;
  grades?: any;
  enrolled_at: Date;
}

export interface UserCoursesResponseDto {
  user_id: string;
  courses: UserCourseDto[];
  total_courses: number;
}

// DTOs para autenticação
export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: UserResponseDto;
  token: string;
  expires_at: Date;
}

export interface RefreshTokenDto {
  refresh_token: string;
}

// DTOs para busca avançada
export interface UserSearchDto {
  query: string;
  filters?: {
    roles?: string[];
    institutions?: string[];
    active_only?: boolean;
    created_after?: Date;
    created_before?: Date;
  };
  pagination?: {
    page: number;
    limit: number;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export interface UserSearchResponseDto {
  users: UserResponseDto[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters_applied: {
    roles?: string[];
    institutions?: string[];
    active_only?: boolean;
    date_range?: {
      from?: Date;
      to?: Date;
    };
  };
}

// DTOs para estatísticas
export interface UserStatsDto {
  total_users: number;
  users_by_role: Record<string, number>;
  users_by_institution: Record<string, number>;
  recent_registrations: number;
  active_users: number;
}

// DTOs para importação/exportação
export interface ImportUserDto {
  email: string;
  name: string;
  role_name: string;
  institution_name: string;
  endereco?: string;
  telefone?: string;
  usuario: string;
  unidade_ensino?: string;
}

export interface ImportUsersResponseDto {
  success: boolean;
  imported: number;
  failed: number;
  errors: Array<{
    row: number;
    email: string;
    error: string;
  }>;
}

export interface ExportUserDto {
  email: string;
  name: string;
  role_name: string;
  institution_name: string;
  endereco?: string;
  telefone?: string;
  usuario: string;
  unidade_ensino?: string;
  created_at: Date;
  updated_at: Date;
}
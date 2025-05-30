import { BaseEntity } from '../types/common';

// DTOs de entrada
export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role_id: string;
  institution_id?: string;
  endereco?: string;
  telefone?: string;
  school_id?: string;
  is_active?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  role_id?: string;
  institution_id?: string;
  endereco?: string;
  telefone?: string;
  school_id?: string;
  is_active?: boolean;
}

export interface UpdateProfileDto {
  email?: string;
  name?: string;
  endereco?: string;
  telefone?: string;
  school_id?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// DTOs de saída
export interface UserResponseDto extends BaseEntity {
  email: string;
  name: string;
  role_id: string;
  institution_id?: string;
  endereco?: string;
  telefone?: string;
  school_id?: string;
  is_active: boolean;
  role_name?: string;
  institution_name?: string;
  school_name?: string;
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
}

// DTOs de validação
export interface UserValidationDto {
  email?: string;
  usuario?: string;
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
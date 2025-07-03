// Tipos de resposta da API que correspondem aos DTOs do backend
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: PaginationResult;
  exists?: boolean;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// DTOs de usuário que correspondem ao backend
export interface CreateUserDto {
  name: any;
  full_name: string;
  email: string;
  password: string;
  role_id: string;
  institution_id: string;
  endereco?: string;
  telefone?: string;
  cpf?: string;
  birth_date?: string;
  is_active?: boolean;
}

export interface UpdateUserDto {
  full_name?: string;
  email?: string;
  password?: string;
  role_id?: string;
  institution_id?: string;
  endereco?: string;
  telefone?: string;
  cpf?: string;
  birth_date?: string;
  is_active?: boolean;
}

export interface UpdateProfileDto {
  email?: string;
  full_name?: string;
  endereco?: string;
  telefone?: string;
  school_id?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface UserResponseDto {
  name: any | string;
  id: string;
<<<<<<< HEAD
  full_name: string;
  email: string;
  role_id: string;
  institution_id: string;
  endereco?: string;
  telefone?: string;
  school_id?: string;
  cpf?: string;
  birth_date?: string;
  is_active: boolean;
=======
  name: string;
  email: string;
  role?: {
    name: string;
    permissions: string[];
  };
  institution_id?: string;
>>>>>>> master
  created_at: string;
  updated_at: string;
  role_name?: string;
  institution_name?: string;
  school_name?: string;
}

export interface UserWithRoleDto extends UserResponseDto {
  role_name: string;
  role_permissions: string[];
}

export interface UserFilterDto {
  search?: string;
  full_name?: string;
  email?: string;
  role?: string;
  role_id?: string;
  institution_id?: string;
  school_id?: string;
  is_active?: boolean;
  created_after?: string;
  created_before?: string;
  page?: number;
  limit?: number;
  sortBy?: 'full_name' | 'email' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

export interface UserCourseDto {
  course_id: string;
  course_name: string;
  course_description?: string;
  user_role: 'student' | 'teacher';
  progress?: number;
  grades?: any;
  enrolled_at: string;
}

// DTOs de autenticação
export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: UserResponseDto;
  token: string;
  sessionId: string;
  expires_at: string;
}

// DTOs de Role
export interface RoleDto {
  id: string;
  name: string;
  description?: string;
  permissions?: string[];
  created_at: string;
  updated_at: string;
}

export interface RoleResponseDto extends RoleDto {
  status: string;
  active?: boolean;
  users_count?: number;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions?: string[];
  active?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
  active?: boolean;
}

export interface RoleCreateDto extends CreateRoleDto {}
export interface RoleUpdateDto extends UpdateRoleDto {}

// DTOs de Institution
export interface InstitutionDto {
  id: string;
  name: string;
  code?: string;
  cnpj?: string;
  description?: string;
  address?: string | {
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
  type?: 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY' | 'TECH_CENTER';
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface InstitutionResponseDto extends InstitutionDto {
  active?: boolean;
  users_count?: number;
  courses_count?: number;
  schools_count?: number;
  settings?: {
    allowStudentRegistration?: boolean;
    requireEmailVerification?: boolean;
    maxSchools?: number;
    maxUsersPerSchool?: number;
  };
  schools?: any[];
  // Campos adicionais da tabela institution
  city?: string;
  state?: string;
  zip_code?: string;
  status?: 'active' | 'inactive';
  logo_url?: string;
}

export interface CreateInstitutionDto {
  name: string;
  code: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  active?: boolean;
  type?: 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY' | 'TECH_CENTER';
}

export interface UpdateInstitutionDto {
  name?: string;
  code?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  active?: boolean;
  type?: 'SCHOOL' | 'COLLEGE' | 'UNIVERSITY' | 'TECH_CENTER';
}

export interface InstitutionCreateDto extends CreateInstitutionDto {}
export interface InstitutionUpdateDto extends UpdateInstitutionDto {}

// DTOs de Course
export interface CourseDto {
  id: string;
  name: string;
  description?: string;
  institution_id: string;
  institution_name?: string;
  level?: string;
  duration?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCourseDto {
  name: string;
  description?: string;
  institution_id: string;
  level?: string;
  duration?: number;
}

export interface UpdateCourseDto {
  name?: string;
  description?: string;
  institution_id?: string;
  level?: string;
  duration?: number;
}

export interface CourseResponseDto {
  id: string;
  name: string;
  description: string;
  level: string;
  type: string;
  active: boolean;
  institution_id: string;
  created_at: string;
  updated_at: string;
  institution?: {
    id: string;
    name: string;
  };
  teachers?: {
    id: string;
    name: string;
  }[];
  students?: {
    id: string;
    name: string;
  }[];
}

export interface CourseCreateDto {
  name: string;
  description: string;
  level: string;
  type: string;
  institution_id: string;
  active?: boolean;
}

export interface CourseUpdateDto {
  name?: string;
  description?: string;
  level?: string;
  type?: string;
  institution_id?: string;
  active?: boolean;
}

// Tipos de erro da API
export interface ApiError {
  name: string;
  message: string;
  status: number;
  errors?: string[];
  details?: any;
}

// Tipos de filtro genérico
export interface BaseFilterDto {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RoleFilterDto extends BaseFilterDto {
  type?: string;
  status?: string;
  active?: boolean;
}

// Tipos de resposta de lista
export interface ListResponse<T> {
  items: T[];
  pagination: PaginationResult;
}

export interface PaginatedResponseDto<T> {
  items: T[];
  pagination: PaginationResult;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Alias para compatibilidade
export interface ApiResponseDto<T> extends ApiResponse<T> {}

// Tipos de operações em lote
export interface BulkOperationResult<T> {
  success: boolean;
  created: T[];
  updated: T[];
  failed: Array<{ data: any; error: string }>;
  total: number;
}

// Tipos de busca
export interface SearchParams {
  query: string;
  filters?: Record<string, any>;
  pagination?: PaginationParams;
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

// Tipos de upload de arquivo
export interface FileUploadResponse {
  success: boolean;
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimetype: string;
}

// Tipos de estatísticas
export interface StatsResponse {
  total_users: number;
  total_courses: number;
  total_institutions: number;
  active_sessions: number;
  recent_activity: any[];
}

// Notification DTOs
export interface NotificationFilterDto extends BaseFilterDto {
  status?: 'sent' | 'scheduled' | 'draft' | 'failed';
  category?: 'academic' | 'system' | 'social' | 'administrative';
  priority?: 'low' | 'medium' | 'high';
  startDate?: string;
  endDate?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface NotificationStatsDto {
  total: number;
  read: number;
  unread: number;
}

export interface UnitResponseDto {
  id: string;
  name: string;
  description: string;
  type: string;
  active: boolean;
  institution_id: string;
  created_at: string;
  updated_at: string;
  institution?: InstitutionResponseDto;
}

export interface UnitCreateDto {
  name: string;
  description: string;
  type: string;
  institution_id: string;
  active?: boolean;
}

export interface UnitUpdateDto {
  name?: string;
  description?: string;
  type?: string;
  institution_id?: string;
  active?: boolean;
}

export interface ClassResponseDto {
  id: string;
  name: string;
  description: string;
  status: string;
  active: boolean;
  course_id: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
  course?: {
    id: string;
    name: string;
  };
  teacher?: {
    id: string;
    name: string;
  };
  students?: {
    id: string;
    name: string;
  }[];
}

export interface ClassCreateDto {
  name: string;
  description: string;
  status: string;
  course_id: string;
  teacher_id: string;
  active?: boolean;
}

export interface ClassUpdateDto {
  name?: string;
  description?: string;
  status?: string;
  course_id?: string;
  teacher_id?: string;
  active?: boolean;
}

// Book DTOs
export interface BookResponseDto {
  id: string;
  name: string;
  subtitle?: string;
  author: string;
  category: string;
  status: string;
  pages: number;
  cover_url?: string;
  published_date: string;
  created_at: string;
  updated_at: string;
}

export interface BookCreateDto {
  name: string;
  subtitle?: string;
  author: string;
  category: string;
  status: string;
  pages: number;
  cover_url?: string;
  published_date: string;
}

export interface BookUpdateDto {
  name?: string;
  subtitle?: string;
  author?: string;
  category?: string;
  status?: string;
  pages?: number;
  cover_url?: string;
  published_date?: string;
}

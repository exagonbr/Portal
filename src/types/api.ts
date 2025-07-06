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
  email: string;
  full_name: string;
  password?: string;
  username?: string;
  institution_id?: string | null;
  role_id?: string;
  
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
  role_id?: string;
  
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
  id: number; // ou number, dependendo do backend
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
  role_id?: string;
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
  expires_at: string;
}

// DTOs de Role
export interface RoleResponseDto {
  id: number;
  name: string;
  description: string;
  active: boolean;
  users_count: number;
  created_at: string;
  updated_at: string;
  status: string;
}

export interface RoleCreateDto {
  name: string;
  description: string;
  active: boolean;
}

export interface RoleUpdateDto {
  name?: string;
  description?: string;
  active?: boolean;
}

// DTOs de Institution
export interface InstitutionResponseDto {
  id: number;
  version?: number;
  accountable_contact: string;
  accountable_name: string;
  company_name: string;
  complement?: string;
  contract_disabled: boolean;
  contract_invoice_num?: string;
  contract_num?: number;
  contract_term_end: string;
  contract_term_start: string;
  date_created?: string;
  deleted: boolean;
  district: string;
  document: string;
  invoice_date?: string;
  last_updated?: string;
  name: string;
  postal_code: string;
  state: string;
  street: string;
  score?: number;
  has_library_platform: boolean;
  has_principal_platform: boolean;
  has_student_platform: boolean;
}

export interface CreateInstitutionDto {
  accountable_contact: string;
  accountable_name: string;
  company_name: string;
  contract_disabled: boolean;
  contract_term_end: string;
  contract_term_start: string;
  deleted: boolean;
  district: string;
  document: string;
  name: string;
  postal_code: string;
  state: string;
  street: string;
  has_library_platform: boolean;
  has_principal_platform: boolean;
  has_student_platform: boolean;
  complement?: string;
  contract_invoice_num?: string;
  contract_num?: number;
  invoice_date?: string;
  score?: number;
}

export interface UpdateInstitutionDto {
  accountable_contact?: string;
  accountable_name?: string;
  company_name?: string;
  contract_disabled?: boolean;
  contract_term_end?: string;
  contract_term_start?: string;
  deleted?: boolean;
  district?: string;
  document?: string;
  name?: string;
  postal_code?: string;
  state?: string;
  street?: string;
  has_library_platform?: boolean;
  has_principal_platform?: boolean;
  has_student_platform?: boolean;
  complement?: string;
  contract_invoice_num?: string;
  contract_num?: number;
  invoice_date?: string;
  score?: number;
}

export type InstitutionRequestDto = CreateInstitutionDto | UpdateInstitutionDto;

// DTOs de Schedule
export interface ScheduleResponseDto {
  id: string;
  title: string;
  start: string;
  end: string;
  class_id: string;
  teacher_id: string;
}

// DTOs de Course
export interface CourseDto {
  id: number;
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
  id: number;
  name: string;
  description: string;
  level: string;
  type: string;
  active: boolean;
  institution_id: string;
  created_at: string;
  updated_at: string;
  institution?: {
    id: number;
    name: string;
  };
  teachers?: {
    id: number;
    name: string;
  }[];
  students?: {
    id: number;
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
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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
  id: number;
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
  id: number;
  name: string;
  description: string;
  status: string;
  active: boolean;
  course_id: string;
  teacher_id: string;
  created_at: string;
  updated_at: string;
  course?: {
    id: number;
    name: string;
  };
  teacher?: {
    id: number;
    name: string;
  };
  students?: {
    id: number;
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
  id: number;
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

// DTOs de Certificado
export interface CertificateResponseDto {
  id: number;
  version?: number;
  date_created: string;
  last_updated?: string;
  path?: string;
  score?: number;
  tv_show_id?: string | null;
  user_id?: string | null;
  document?: string;
  license_code?: string;
  tv_show_name?: string;
  recreate?: boolean;
}

export interface CreateCertificateDto {
  date_created: string;
  path?: string;
  score?: number;
  tv_show_id?: string | null;
  user_id?: string | null;
  document?: string;
  license_code?: string;
  tv_show_name?: string;
  recreate?: boolean;
}

export interface UpdateCertificateDto {
  date_created?: string;
  last_updated?: string;
  path?: string;
  score?: number;
  tv_show_id?: string | null;
  user_id?: string | null;
  document?: string;
  license_code?: string;
  tv_show_name?: string;
  recreate?: boolean;
}

// DTOs de Unidade
export interface UnitResponseDto {
  id: number;
  version?: number;
  date_created?: string;
  deleted?: boolean;
  institution_id: string;
  last_updated?: string;
  name: string;
  institution_name?: string;
}

export interface CreateUnitDto {
  name: string;
  institution_id: string;
  institution_name?: string;
  deleted?: boolean;
  date_created?: string;
}

export interface UpdateUnitDto {
  name?: string;
  institution_id?: string;
  institution_name?: string;
  deleted?: boolean;
  last_updated?: string;
}

// DTOs de Autor
export interface AuthorResponseDto {
  id: number;
  version?: number;
  description: string;
  email?: string;
  is_active?: boolean;
  name: string;
}

export interface CreateAuthorDto {
  description: string;
  name: string;
  email?: string;
  is_active?: boolean;
}

export interface UpdateAuthorDto {
  description?: string;
  name?: string;
  email?: string;
  is_active?: boolean;
}

// DTOs de CookieSigned
export interface CookieSignedResponseDto {
  id: number;
  cookie?: string;
}

export interface CreateCookieSignedDto {
  cookie?: string;
}

export interface UpdateCookieSignedDto {
  cookie?: string;
}

// DTOs de EducationPeriod
export interface EducationPeriodResponseDto {
  id: number;
  version?: number;
  description: string;
  is_active?: boolean;
}

export interface CreateEducationPeriodDto {
  description: string;
  is_active?: boolean;
}

export interface UpdateEducationPeriodDto {
  description?: string;
  is_active?: boolean;
}

// DTOs de EducationalStage
export interface EducationalStageResponseDto {
  id: number;
  version?: number;
  date_created?: string;
  deleted: boolean;
  grade_1?: boolean;
  grade_2?: boolean;
  grade_3?: boolean;
  grade_4?: boolean;
  grade_5?: boolean;
  grade_6?: boolean;
  grade_7?: boolean;
  grade_8?: boolean;
  grade_9?: boolean;
  last_updated?: string;
  name: string;
  uuid?: string;
}

export interface CreateEducationalStageDto {
  deleted: boolean;
  name: string;
  date_created?: string;
  grade_1?: boolean;
  grade_2?: boolean;
  grade_3?: boolean;
  grade_4?: boolean;
  grade_5?: boolean;
  grade_6?: boolean;
  grade_7?: boolean;
  grade_8?: boolean;
  grade_9?: boolean;
  uuid?: string;
}

export interface UpdateEducationalStageDto {
  deleted?: boolean;
  name?: string;
  last_updated?: string;
  grade_1?: boolean;
  grade_2?: boolean;
  grade_3?: boolean;
  grade_4?: boolean;
  grade_5?: boolean;
  grade_6?: boolean;
  grade_7?: boolean;
  grade_8?: boolean;
  grade_9?: boolean;
  uuid?: string;
}

// DTOs de File
export interface FileResponseDto {
  id: number;
  version?: number;
  content_type?: string;
  date_created: string;
  extension?: string;
  external_link?: string;
  is_default?: boolean;
  is_public?: boolean;
  label?: string;
  last_updated: string;
  local_file?: string;
  name?: string;
  original_filename?: string;
  quality?: string;
  sha256hex?: string;
  size?: number;
  subtitle_label?: string;
  subtitle_src_lang?: string;
  is_subtitled?: boolean;
}

export interface CreateFileDto {
  date_created: string;
  last_updated: string;
  content_type?: string;
  extension?: string;
  external_link?: string;
  is_default?: boolean;
  is_public?: boolean;
  label?: string;
  local_file?: string;
  name?: string;
  original_filename?: string;
  quality?: string;
  sha256hex?: string;
  size?: number;
  subtitle_label?: string;
  subtitle_src_lang?: string;
  is_subtitled?: boolean;
}

export interface UpdateFileDto {
  last_updated: string;
  content_type?: string;
  extension?: string;
  external_link?: string;
  is_default?: boolean;
  is_public?: boolean;
  label?: string;
  local_file?: string;
  name?: string;
  original_filename?: string;
  quality?: string;
  sha256hex?: string;
  size?: number;
  subtitle_label?: string;
  subtitle_src_lang?: string;
  is_subtitled?: boolean;
}

// DTOs de ForgotPassword
export interface ForgotPasswordResponseDto {
  id: number;
  version?: number;
  email?: string;
}

export interface CreateForgotPasswordDto {
  email?: string;
}

export interface UpdateForgotPasswordDto {
  email?: string;
}

// DTOs de Genre
export interface GenreResponseDto {
  id: number;
  version?: number;
  api_id: number;
  name: string;
}

export interface CreateGenreDto {
  api_id: number;
  name: string;
}

export interface UpdateGenreDto {
  api_id?: number;
  name?: string;
}

// DTOs de Public
export interface PublicResponseDto {
  id: number;
  version?: number;
  api_id: number;
  name: string;
}

export interface CreatePublicDto {
  api_id: number;
  name: string;
}

export interface UpdatePublicDto {
  api_id?: number;
  name?: string;
}

// DTOs de Settings
export interface SettingsResponseDto {
  id: number;
  version?: number;
  default_value?: string;
  description?: string;
  name?: string;
  required?: boolean;
  settings_key: string;
  settings_type?: string;
  validation_required?: boolean;
  value?: string;
}

export interface CreateSettingsDto {
  settings_key: string;
  default_value?: string;
  description?: string;
  name?: string;
  required?: boolean;
  settings_type?: string;
  validation_required?: boolean;
  value?: string;
}

export interface UpdateSettingsDto {
  settings_key?: string;
  default_value?: string;
  description?: string;
  name?: string;
  required?: boolean;
  settings_type?: string;
  validation_required?: boolean;
  value?: string;
}

// DTOs de Tag
export interface TagResponseDto {
  id: number;
  version?: number;
  date_created: string;
  deleted?: boolean;
  last_updated: string;
  name?: string;
}

export interface CreateTagDto {
  date_created: string;
  last_updated: string;
  deleted?: boolean;
  name?: string;
}

export interface UpdateTagDto {
  last_updated: string;
  deleted?: boolean;
  name?: string;
}

// DTOs de TargetAudience
export interface TargetAudienceResponseDto {
  id: number;
  version?: number;
  description: string;
  is_active?: boolean;
  name: string;
}

export interface CreateTargetAudienceDto {
  description: string;
  name: string;
  is_active?: boolean;
}

export interface UpdateTargetAudienceDto {
  description?: string;
  name?: string;
  is_active?: boolean;
}

// DTOs de TeacherSubject
export interface TeacherSubjectResponseDto {
  id: number;
  version?: number;
  is_child?: boolean;
  is_deleted?: boolean;
  name?: string;
  uuid?: string;
}

export interface CreateTeacherSubjectDto {
  is_child?: boolean;
  is_deleted?: boolean;
  name?: string;
  uuid?: string;
}

export interface UpdateTeacherSubjectDto {
  is_child?: boolean;
  is_deleted?: boolean;
  name?: string;
  uuid?: string;
}

// DTOs de Theme
export interface ThemeResponseDto {
  id: number;
  version?: number;
  description: string;
  is_active?: boolean;
  name: string;
}

export interface CreateThemeDto {
  description: string;
  name: string;
  is_active?: boolean;
}

export interface UpdateThemeDto {
  description?: string;
  name?: string;
  is_active?: boolean;
}

// DTOs de TvShow
export interface TvShowResponseDto {
  id: number;
  version?: number;
  api_id?: string;
  backdrop_image_id?: string | null;
  backdrop_path?: string;
  contract_term_end: string;
  date_created: string;
  deleted?: boolean;
  first_air_date: string;
  imdb_id?: string;
  last_updated: string;
  manual_input?: boolean;
  manual_support_id?: string | null;
  manual_support_path?: string;
  name: string;
  original_language?: string;
  overview?: string;
  popularity?: number;
  poster_image_id?: string | null;
  poster_path?: string;
  producer?: string;
  vote_average?: number;
  vote_count?: number;
  total_load?: string;
}

export interface CreateTvShowDto {
  contract_term_end: string;
  date_created: string;
  first_air_date: string;
  last_updated: string;
  name: string;
  api_id?: string;
  backdrop_image_id?: string | null;
  backdrop_path?: string;
  deleted?: boolean;
  imdb_id?: string;
  manual_input?: boolean;
  manual_support_id?: string | null;
  manual_support_path?: string;
  original_language?: string;
  overview?: string;
  popularity?: number;
  poster_image_id?: string | null;
  poster_path?: string;
  producer?: string;
  vote_average?: number;
  vote_count?: number;
  total_load?: string;
}

export interface UpdateTvShowDto {
  last_updated: string;
  contract_term_end?: string;
  first_air_date?: string;
  name?: string;
  api_id?: string;
  backdrop_image_id?: string | null;
  backdrop_path?: string;
  deleted?: boolean;
  imdb_id?: string;
  manual_input?: boolean;
  manual_support_id?: string | null;
  manual_support_path?: string;
  original_language?: string;
  overview?: string;
  popularity?: number;
  poster_image_id?: string | null;
  poster_path?: string;
  producer?: string;
  vote_average?: number;
  vote_count?: number;
  total_load?: string;
}

// DTOs de UnitClass
export interface UnitClassResponseDto {
  id: number;
  version?: number;
  date_created?: string;
  deleted: boolean;
  institution_id: string;
  last_updated?: string;
  name: string;
  unit_id: string;
  institution_name?: string;
  unit_name?: string;
}

export interface CreateUnitClassDto {
  deleted: boolean;
  institution_id: string;
  name: string;
  unit_id: string;
  date_created?: string;
  institution_name?: string;
  unit_name?: string;
}

export interface UpdateUnitClassDto {
  deleted?: boolean;
  institution_id?: string;
  name?: string;
  unit_id?: string;
  last_updated?: string;
  institution_name?: string;
  unit_name?: string;
}

// DTOs de Video
export interface VideoResponseDto {
  id: number;
  version?: number;
  api_id?: string;
  date_created?: string;
  deleted?: boolean;
  imdb_id?: string;
  intro_end?: number;
  intro_start?: number;
  last_updated?: string;
  original_language?: string;
  outro_start?: number;
  overview?: string;
  popularity?: number;
  report_count?: number;
  vote_average?: number;
  vote_count?: number;
  class: string;
  backdrop_path?: string;
  poster_image_id?: string | null;
  poster_path?: string;
  release_date?: string;
  title?: string;
  trailer_key?: string;
  backdrop_image_id?: string | null;
  air_date?: string;
  episode_string?: string;
  episode_number?: number;
  name?: string;
  season_episode_merged?: number;
  season_number?: number;
  show_id?: string | null;
  still_image_id?: string | null;
  still_path?: string;
  duration?: string;
}

export interface CreateVideoDto {
  class: string;
  api_id?: string;
  date_created?: string;
  deleted?: boolean;
  imdb_id?: string;
  intro_end?: number;
  intro_start?: number;
  last_updated?: string;
  original_language?: string;
  outro_start?: number;
  overview?: string;
  popularity?: number;
  report_count?: number;
  vote_average?: number;
  vote_count?: number;
  backdrop_path?: string;
  poster_image_id?: string | null;
  poster_path?: string;
  release_date?: string;
  title?: string;
  trailer_key?: string;
  backdrop_image_id?: string | null;
  air_date?: string;
  episode_string?: string;
  episode_number?: number;
  name?: string;
  season_episode_merged?: number;
  season_number?: number;
  show_id?: string | null;
  still_image_id?: string | null;
  still_path?: string;
  duration?: string;
}

export interface UpdateVideoDto {
  class?: string;
  api_id?: string;
  last_updated?: string;
  deleted?: boolean;
  imdb_id?: string;
  intro_end?: number;
  intro_start?: number;
  original_language?: string;
  outro_start?: number;
  overview?: string;
  popularity?: number;
  report_count?: number;
  vote_average?: number;
  vote_count?: number;
  backdrop_path?: string;
  poster_image_id?: string | null;
  poster_path?: string;
  release_date?: string;
  title?: string;
  trailer_key?: string;
  backdrop_image_id?: string | null;
  air_date?: string;
  episode_string?: string;
  episode_number?: number;
  name?: string;
  season_episode_merged?: number;
  season_number?: number;
  show_id?: string | null;
  still_image_id?: string | null;
  still_path?: string;
  duration?: string;
}

// DTOs de NotificationQueue
export interface NotificationQueueResponseDto {
  id: number;
  version?: number;
  date_created: string;
  description?: string;
  is_completed?: boolean;
  last_updated: string;
  movie_id?: string | null;
  tv_show_id?: string | null;
  type?: string;
  video_to_play_id?: string | null;
}

export interface CreateNotificationQueueDto {
  date_created: string;
  last_updated: string;
  description?: string;
  is_completed?: boolean;
  movie_id?: string | null;
  tv_show_id?: string | null;
  type?: string;
  video_to_play_id?: string | null;
}

export interface UpdateNotificationQueueDto {
  last_updated: string;
  description?: string;
  is_completed?: boolean;
  movie_id?: string | null;
  tv_show_id?: string | null;
  type?: string;
  video_to_play_id?: string | null;
}

// DTOs de Profile
export interface ProfileResponseDto {
  id: number;
  version?: number;
  avatar_color?: string;
  is_child?: boolean;
  is_deleted?: boolean;
  profile_language?: string;
  profile_name?: string;
  user_id?: string | null;
}

export interface CreateProfileDto {
  avatar_color?: string;
  is_child?: boolean;
  is_deleted?: boolean;
  profile_language?: string;
  profile_name?: string;
  user_id?: string | null;
}

export interface UpdateProfileDto {
  avatar_color?: string;
  is_child?: boolean;
  is_deleted?: boolean;
  profile_language?: string;
  profile_name?: string;
  user_id?: string | null;
}

// DTOs de Question
export interface QuestionResponseDto {
  id: number;
  version?: number;
  date_created: string;
  deleted?: boolean;
  file_id?: string | null;
  last_updated?: string;
  test?: string;
  tv_show_id?: string | null;
  episode_id?: string | null;
}

export interface CreateQuestionDto {
  date_created: string;
  deleted?: boolean;
  file_id?: string | null;
  last_updated?: string;
  test?: string;
  tv_show_id?: string | null;
  episode_id?: string | null;
}

export interface UpdateQuestionDto {
  last_updated?: string;
  deleted?: boolean;
  file_id?: string | null;
  test?: string;
  tv_show_id?: string | null;
  episode_id?: string | null;
}

// DTOs de Report
export interface ReportResponseDto {
  id: number;
  version?: number;
  created_by_id?: string | null;
  date_created: string;
  error_code?: string;
  last_updated: string;
  resolved?: boolean;
  video_id?: string | null;
}

export interface CreateReportDto {
  date_created: string;
  last_updated: string;
  created_by_id?: string | null;
  error_code?: string;
  resolved?: boolean;
  video_id?: string | null;
}

export interface UpdateReportDto {
  last_updated: string;
  created_by_id?: string | null;
  error_code?: string;
  resolved?: boolean;
  video_id?: string | null;
}

// DTOs de UserActivity
export interface UserActivityResponseDto {
  id: number;
  version?: number;
  browser?: string;
  date_created: string;
  device?: string;
  ip_address?: string;
  last_updated?: string;
  operating_system?: string;
  type?: string;
  user_id?: string | null;
  video_id?: string | null;
  institution_id?: string | null;
  unit_id?: string | null;
  fullname?: string;
  institution_name?: string;
  is_certified?: boolean;
  username?: string;
  units_data?: string;
  user_data?: string;
  populated: boolean;
  role?: string;
}

export interface CreateUserActivityDto {
  date_created: string;
  populated: boolean;
  browser?: string;
  device?: string;
  ip_address?: string;
  last_updated?: string;
  operating_system?: string;
  type?: string;
  user_id?: string | null;
  video_id?: string | null;
  institution_id?: string | null;
  unit_id?: string | null;
  fullname?: string;
  institution_name?: string;
  is_certified?: boolean;
  username?: string;
  units_data?: string;
  user_data?: string;
  role?: string;
}

export interface UpdateUserActivityDto {
  last_updated?: string;
  populated?: boolean;
  browser?: string;
  device?: string;
  ip_address?: string;
  operating_system?: string;
  type?: string;
  user_id?: string | null;
  video_id?: string | null;
  institution_id?: string | null;
  unit_id?: string | null;
  fullname?: string;
  institution_name?: string;
  is_certified?: boolean;
  username?: string;
  units_data?: string;
  user_data?: string;
  role?: string;
}

// DTOs de ViewingStatus
export interface ViewingStatusResponseDto {
  id: number;
  version?: number;
  completed?: boolean;
  current_play_time: number;
  date_created?: string;
  last_updated?: string;
  profile_id?: string | null;
  runtime?: number;
  tv_show_id?: string | null;
  user_id?: string | null;
  video_id: string;
}

export interface CreateViewingStatusDto {
  current_play_time: number;
  video_id: string;
  completed?: boolean;
  date_created?: string;
  last_updated?: string;
  profile_id?: string | null;
  runtime?: number;
  tv_show_id?: string | null;
  user_id?: string | null;
}

export interface UpdateViewingStatusDto {
  current_play_time?: number;
  video_id?: string;
  completed?: boolean;
  last_updated?: string;
  profile_id?: string | null;
  runtime?: number;
  tv_show_id?: string | null;
  user_id?: string | null;
}

// DTOs de WatchlistEntry
export interface WatchlistEntryResponseDto {
  id: number;
  version?: number;
  date_created?: string;
  is_deleted: boolean;
  last_updated?: string;
  profile_id: string;
  tv_show_id?: string | null;
  user_id: string;
  video_id?: string | null;
}

export interface CreateWatchlistEntryDto {
  is_deleted: boolean;
  profile_id: string;
  user_id: string;
  date_created?: string;
  last_updated?: string;
  tv_show_id?: string | null;
  video_id?: string | null;
}

export interface UpdateWatchlistEntryDto {
  is_deleted?: boolean;
  profile_id?: string;
  user_id?: string;
  last_updated?: string;
  tv_show_id?: string | null;
  video_id?: string | null;
}

// DTOs de Answer
export interface AnswerResponseDto {
  id: number;
  version?: number;
  date_created: string;
  deleted?: boolean;
  is_correct?: boolean;
  last_updated?: string;
  question_id?: string | null;
  reply?: string;
}

export interface CreateAnswerDto {
  date_created: string;
  deleted?: boolean;
  is_correct?: boolean;
  last_updated?: string;
  question_id?: string | null;
  reply?: string;
}

export interface UpdateAnswerDto {
  last_updated?: string;
  deleted?: boolean;
  is_correct?: boolean;
  question_id?: string | null;
  reply?: string;
}

// DTOs de UserAnswer
export interface UserAnswerResponseDto {
  id: number;
  answer_id: string;
  question_id: string;
  version?: number;
  date_created: string;
  is_correct?: boolean;
  last_updated?: string;
  score?: number;
  user_id?: string | null;
}

export interface CreateUserAnswerDto {
  answer_id: string;
  question_id: string;
  date_created: string;
  is_correct?: boolean;
  last_updated?: string;
  score?: number;
  user_id?: string | null;
}

export interface UpdateUserAnswerDto {
  answer_id?: string;
  question_id?: string;
  last_updated?: string;
  is_correct?: boolean;
  score?: number;
  user_id?: string | null;
}

// DTOs de School
export interface SchoolResponseDto {
  id: number;
  version?: number;
  date_created?: string;
  deleted?: boolean;
  institutionId: number;
  last_updated?: string;
  name: string;
  institutionName?: string;
  total_students?: number;
  total_teachers?: number;
  total_classes?: number;
}

export interface CreateSchoolDto {
  name: string;
  institutionId: number;
  institutionName?: string;
  deleted?: boolean;
  date_created?: string;
}

export interface UpdateSchoolDto {
  name?: string;
  institutionId?: number;
  institutionName?: string;
  deleted?: boolean;
  last_updated?: string;
}

// DTOs de Class
export interface ClassResponseDto {
  id: number;
  name: string;
  code: string;
  school_id: string;
  year: number;
  shift: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_TIME';
  max_students: number;
  is_active: boolean;
  school_name?: string;
  student_count?: number;
  teacher_count?: number;
}

export interface CreateClassDto {
  name: string;
  code: string;
  school_id: string;
  year: number;
  shift: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_TIME';
  max_students: number;
  is_active?: boolean;
}

export interface UpdateClassDto {
  name?: string;
  code?: string;
  school_id?: string;
  year?: number;
  shift?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_TIME';
  max_students?: number;
  is_active?: boolean;
}

// DTOs de Announcement
export interface AnnouncementResponseDto {
  id: string;
  title: string;
  content: string;
  author_id: string;
  expires_at?: string;
  priority: 'baixa' | 'média' | 'alta' | 'urgente';
  scope: {
    type: 'global' | 'turma' | 'curso' | 'institution';
    targetId?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateAnnouncementDto {
  title: string;
  content: string;
  author_id: string;
  expires_at?: string;
  priority: 'baixa' | 'média' | 'alta' | 'urgente';
  scope: {
    type: 'global' | 'turma' | 'curso' | 'institution';
    targetId?: string;
  };
}

export interface UpdateAnnouncementDto {
  title?: string;
  content?: string;
  expires_at?: string;
  priority?: 'baixa' | 'média' | 'alta' | 'urgente';
  scope?: {
    type: 'global' | 'turma' | 'curso' | 'institution';
    targetId?: string;
  };
}

// DTOs de Author
export interface AuthorResponseDto {
  id: number;
  version?: number;
  description: string;
  email?: string;
  is_active?: boolean;
  name: string;
}

export interface CreateAuthorDto {
  description: string;
  name: string;
  email?: string;
  is_active?: boolean;
}

export interface UpdateAuthorDto {
  description?: string;
  name?: string;
  email?: string;
  is_active?: boolean;
}

// DTOs de Book
export interface BookResponseDto {
  id: number;
  title: string;
  author: string;
  publisher: string;
  synopsis: string;
  thumbnail?: string;
  url: string;
  s3_key?: string;
  size: number;
  education_level: string;
  cycle?: string;
  grade?: string;
  subject?: string;
  tags: string[];
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookDto {
  title: string;
  author: string;
  publisher: string;
  synopsis: string;
  thumbnail?: string;
  url: string;
  s3_key?: string;
  size: number;
  education_level: string;
  cycle?: string;
  grade?: string;
  subject?: string;
  tags?: string[];
  uploaded_by: string;
}

export interface UpdateBookDto {
  title?: string;
  author?: string;
  publisher?: string;
  synopsis?: string;
  thumbnail?: string;
  url?: string;
  s3_key?: string;
  size?: number;
  education_level?: string;
  cycle?: string;
  grade?: string;
  subject?: string;
  tags?: string[];
}

// DTOs de ChatMessage
export interface ChatMessageResponseDto {
  id: string;
  sender_id: string;
  content: string;
  class_id: string;
  attachments?: any[];
  read_by: string[];
  timestamp: string;
}

export interface CreateChatMessageDto {
  sender_id: string;
  content: string;
  class_id: string;
  attachments?: any[];
}

// DTOs de Collection
export interface CollectionResponseDto {
  id: string;
  name: string;
  synopsis: string;
  cover_image: string;
  support_material?: string;
  total_duration: number;
  subject: string;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCollectionDto {
  name: string;
  synopsis: string;
  cover_image: string;
  support_material?: string;
  total_duration: number;
  subject: string;
  tags?: string[];
  created_by: string;
}

export interface UpdateCollectionDto {
  name?: string;
  synopsis?: string;
  cover_image?: string;
  support_material?: string;
  total_duration?: number;
  subject?: string;
  tags?: string[];
}

// DTOs de EducationCycle
export interface EducationCycleResponseDto {
  id: string;
  name: string;
  level: 'EDUCACAO_INFANTIL' | 'ENSINO_FUNDAMENTAL_I' | 'ENSINO_FUNDAMENTAL_II' | 'ENSINO_MEDIO' | 'ENSINO_TECNICO' | 'ENSINO_SUPERIOR';
  description?: string;
  duration_years: number;
  min_age?: number;
  max_age?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateEducationCycleDto {
  name: string;
  level: 'EDUCACAO_INFANTIL' | 'ENSINO_FUNDAMENTAL_I' | 'ENSINO_FUNDAMENTAL_II' | 'ENSINO_MEDIO' | 'ENSINO_TECNICO' | 'ENSINO_SUPERIOR';
  description?: string;
  duration_years: number;
  min_age?: number;
  max_age?: number;
}

export interface UpdateEducationCycleDto {
  name?: string;
  level?: 'EDUCACAO_INFANTIL' | 'ENSINO_FUNDAMENTAL_I' | 'ENSINO_FUNDAMENTAL_II' | 'ENSINO_MEDIO' | 'ENSINO_TECNICO' | 'ENSINO_SUPERIOR';
  description?: string;
  duration_years?: number;
  min_age?: number;
  max_age?: number;
}

// DTOs de Forum
export interface ForumThreadResponseDto {
  id: string;
  class_id: string;
  title: string;
  content: string;
  author_id: string;
  tags: string[];
  pinned: boolean;
  locked: boolean;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface CreateForumThreadDto {
  class_id: string;
  title: string;
  content: string;
  author_id: string;
  tags?: string[];
  pinned?: boolean;
  locked?: boolean;
}

export interface UpdateForumThreadDto {
  title?: string;
  content?: string;
  tags?: string[];
  pinned?: boolean;
  locked?: boolean;
}

export interface ForumReplyResponseDto {
    id: string;
    thread_id: string;
    parent_reply_id?: string;
    content: string;
    author_id: string;
    likes: string[];
    created_at: string;
    updated_at: string;
}

export interface CreateForumReplyDto {
    thread_id: string;
    parent_reply_id?: string;
    content: string;
    author_id: string;
}

// DTOs de Notification
export interface NotificationResponseDto {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'academic' | 'system' | 'social' | 'administrative';
  sent_at?: string;
  sent_by_id: string;
  recipients: {
    total?: number;
    read?: number;
    unread?: number;
    roles?: string[];
    specific?: string[];
  };
  status: 'sent' | 'scheduled' | 'draft' | 'failed';
  scheduled_for?: string;
  priority: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'academic' | 'system' | 'social' | 'administrative';
  sent_by_id: string;
  recipients: {
    roles?: string[];
    specific?: string[];
  };
  status?: 'sent' | 'scheduled' | 'draft' | 'failed';
  scheduled_for?: string;
  priority?: 'low' | 'medium' | 'high';
}

// DTOs de SchoolManager
export interface SchoolManagerResponseDto {
  id: string;
  user_id: string;
  school_id: string;
  position: 'PRINCIPAL' | 'VICE_PRINCIPAL' | 'COORDINATOR' | 'SUPERVISOR';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  user_name?: string;
  school_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSchoolManagerDto {
  user_id: string;
  school_id: string;
  position: 'PRINCIPAL' | 'VICE_PRINCIPAL' | 'COORDINATOR' | 'SUPERVISOR';
  start_date: string;
  end_date?: string;
  is_active?: boolean;
}

export interface UpdateSchoolManagerDto {
  user_id?: string;
  school_id?: string;
  position?: 'PRINCIPAL' | 'VICE_PRINCIPAL' | 'COORDINATOR' | 'SUPERVISOR';
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

// DTOs de UserClass
export interface UserClassResponseDto {
  id: string;
  user_id: string;
  class_id: string;
  role: 'STUDENT' | 'TEACHER' | 'COORDINATOR';
  enrollment_date: string;
  exit_date?: string;
  is_active: boolean;
  user_name?: string;
  class_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserClassDto {
  user_id: string;
  class_id: string;
  role: 'STUDENT' | 'TEACHER' | 'COORDINATOR';
  enrollment_date: string;
  exit_date?: string;
  is_active?: boolean;
}

export interface UpdateUserClassDto {
  user_id?: string;
  class_id?: string;
  role?: 'STUDENT' | 'TEACHER' | 'COORDINATOR';
  enrollment_date?: string;
  exit_date?: string;
  is_active?: boolean;
}

// DTOs de VideoCollection
export interface VideoCollectionResponseDto {
  id: string;
  name: string;
  synopsis?: string;
  producer?: string;
  release_date?: string;
  contract_expiry_date?: string;
  authors: string[];
  target_audience: string[];
  total_hours: string;
  poster_image_url?: string;
  carousel_image_url?: string;
  ebook_file_url?: string;
  use_default_cover_for_videos: boolean;
  deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateVideoCollectionDto {
  name: string;
  synopsis?: string;
  producer?: string;
  release_date?: string;
  contract_expiry_date?: string;
  authors: string[];
  target_audience: string[];
  total_hours: string;
  poster_image_url?: string;
  carousel_image_url?: string;
  ebook_file_url?: string;
  use_default_cover_for_videos?: boolean;
  deleted?: boolean;
}

export interface UpdateVideoCollectionDto {
  name?: string;
  synopsis?: string;
  producer?: string;
  release_date?: string;
  contract_expiry_date?: string;
  authors?: string[];
  target_audience?: string[];
  total_hours?: string;
  poster_image_url?: string;
  carousel_image_url?: string;
  ebook_file_url?: string;
  use_default_cover_for_videos?: boolean;
  deleted?: boolean;
}

// DTOs de Quiz/Question
export interface QuestionResponseDto {
  id: number;
  quiz_id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  text: string;
  options?: string[];
  correct_answer: string | string[];
  points: number;
  explanation?: string;
  created_at: string;
  updated_at: string;
}

export interface QuizResponseDto {
  id: string;
  title: string;
  description: string;
  time_limit?: number;
  passing_score: number;
  attempts: number;
  is_graded: boolean;
  questions: QuestionResponseDto[];
  created_at: string;
  updated_at: string;
}

export interface CreateQuizDto {
  title: string;
  description: string;
  time_limit?: number;
  passing_score: number;
  attempts?: number;
  is_graded?: boolean;
  questions: Array<Omit<QuestionResponseDto, 'id' | 'created_at' | 'updated_at' | 'quiz_id'>>;
}

export interface UpdateQuizDto {
  title?: string;
  description?: string;
  time_limit?: number;
  passing_score?: number;
  attempts?: number;
  is_graded?: boolean;
}

// DTOs de Settings
export interface SettingsResponseDto {
  id: number;
  version?: number;
  default_value?: string;
  description?: string;
  name?: string;
  required?: boolean;
  settings_key: string;
  settings_type?: string;
  validation_required?: boolean;
  value?: string;
}

export interface UpdateSettingsDto {
    [key: string]: any;
}

// DTOs de EducationalStage
export interface EducationalStageResponseDto {
  id: number;
  version?: number;
  date_created?: string;
  deleted: boolean;
  grade_1?: boolean;
  grade_2?: boolean;
  grade_3?: boolean;
  grade_4?: boolean;
  grade_5?: boolean;
  grade_6?: boolean;
  grade_7?: boolean;
  grade_8?: boolean;
  grade_9?: boolean;
  last_updated?: string;
  name: string;
  uuid?: string;
}

export interface CreateEducationalStageDto {
  deleted: boolean;
  name: string;
  date_created?: string;
  grade_1?: boolean;
  grade_2?: boolean;
  grade_3?: boolean;
  grade_4?: boolean;
  grade_5?: boolean;
  grade_6?: boolean;
  grade_7?: boolean;
  grade_8?: boolean;
  grade_9?: boolean;
  uuid?: string;
}

export interface UpdateEducationalStageDto {
  deleted?: boolean;
  name?: string;
  last_updated?: string;
  grade_1?: boolean;
  grade_2?: boolean;
  grade_3?: boolean;
  grade_4?: boolean;
  grade_5?: boolean;
  grade_6?: boolean;
  grade_7?: boolean;
  grade_8?: boolean;
  grade_9?: boolean;
  uuid?: string;
}

// DTOs de EducationPeriod
export interface EducationPeriodResponseDto {
  id: number;
  version?: number;
  description: string;
  is_active?: boolean;
}

export interface CreateEducationPeriodDto {
  description: string;
  is_active?: boolean;
}

export interface UpdateEducationPeriodDto {
  description?: string;
  is_active?: boolean;
}

// DTOs de Language
export interface LanguageResponseDto {
  id: number;
  version?: number;
  code: string;
  is_active: boolean;
  name: string;
}

export interface CreateLanguageDto {
  code: string;
  name: string;
  is_active?: boolean;
}

export interface UpdateLanguageDto {
  code?: string;
  name?: string;
  is_active?: boolean;
}

// DTOs de MediaEntry
export interface MediaEntryResponseDto {
  id: number;
  version?: number;
  amount_of_views?: number;
  author_id?: number;
  date_created?: string;
  deleted?: boolean;
  description?: string;
  education_period_id?: number;
  educational_stage_id?: number;
  enabled?: boolean;
  genre_id?: number;
  isbn?: string;
  language_id?: number;
  last_updated?: string;
  name?: string;
  publisher_id?: number;
  subject_id?: number;
  uuid?: string;
  year_of_publication?: number;
  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_popular: boolean;
  is_recommended: boolean;
  tags?: string;
  keywords?: string;
  category?: string;
  subcategory?: string;
  type?: string;
  format?: string;
  duration?: string;
  pages?: string;
  size?: string;
  url?: string;
  thumbnail?: string;
  cover?: string;
  preview?: string;
  price?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  downloads?: number;
  likes?: number;
  shares?: number;
  comments?: number;
}

export interface CreateMediaEntryDto {
  name: string;
  type: string;
  url: string;
  description?: string;
  thumbnail?: string;
  author_id?: number;
  publisher_id?: number;
  genre_id?: number;
  subject_id?: number;
  is_active?: boolean;
}

export interface UpdateMediaEntryDto {
  name?: string;
  type?: string;
  url?: string;
  description?: string;
  thumbnail?: string;
  author_id?: number;
  publisher_id?: number;
  genre_id?: number;
  subject_id?: number;
  is_active?: boolean;
}

// DTOs de Module
export interface ModuleResponseDto {
  id: string;
  name: string;
  description: string;
  cover_image: string;
  order: number;
  collection_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateModuleDto {
  name: string;
  description: string;
  cover_image: string;
  order: number;
  collection_id: string;
}

export interface UpdateModuleDto {
  name?: string;
  description?: string;
  cover_image?: string;
  order?: number;
  collection_id?: string;
}

// DTOs de Publisher
export interface PublisherResponseDto {
  id: number;
  version?: number;
  description: string;
  is_active: boolean;
  name: string;
}

export interface CreatePublisherDto {
  description: string;
  name: string;
  is_active?: boolean;
}

export interface UpdatePublisherDto {
  description?: string;
  name?: string;
  is_active?: boolean;
}

// DTOs de Subject
export interface SubjectResponseDto {
  id: number;
  version?: number;
  description: string;
  is_active: boolean;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSubjectDto {
  description: string;
  name: string;
  is_active?: boolean;
}

export interface UpdateSubjectDto {
  description?: string;
  name?: string;
  is_active?: boolean;
}

// DTOs de VideoModule
export interface VideoModuleResponseDto {
  id: string;
  collection_id: string;
  module_number: number;
  title: string;
  synopsis: string;
  release_year: number;
  duration: string;
  education_cycle: string;
  poster_image_url?: string;
  video_url?: string;
  order_in_module: number;
  created_at: string;
  updated_at: string;
}

export interface CreateVideoModuleDto {
  collection_id: string;
  module_number: number;
  title: string;
  synopsis: string;
  release_year: number;
  duration: string;
  education_cycle: string;
  poster_image_url?: string;
  video_url?: string;
  order_in_module?: number;
}

export interface UpdateVideoModuleDto {
  collection_id?: string;
  module_number?: number;
  title?: string;
  synopsis?: string;
  release_year?: number;
  duration?: string;
  education_cycle?: string;
  poster_image_url?: string;
  video_url?: string;
  order_in_module?: number;
}

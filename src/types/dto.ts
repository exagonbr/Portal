/**
 * DTOs centralizados para comunicação entre frontend e backend
 * Garante compatibilidade e consistência de tipos
 */

import { 
  BaseEntityDto, 
  InstitutionType, 
  UserRole,
  UUID,
  DateString,
  Phone,
  Email,
  ApiResponse,
  PaginatedResponse
} from './common';

// ===== USER DTOs =====

export interface UserDto extends BaseEntityDto {
  name: string;
  email: Email;
  cpf?: string;
  phone?: Phone;
  birth_date?: DateString;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  
  // Campos legados para compatibilidade
  telefone?: Phone;
  endereco?: string;
  
  role_id: UUID;
  institution_id?: UUID;
  school_id?: UUID;
  is_active: boolean;
}

export interface CreateUserDto {
  name: string;
  email: Email;
  password: string;
  cpf?: string;
  phone?: Phone;
  birth_date?: DateString;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  
  // Campos legados para compatibilidade
  telefone?: Phone;
  endereco?: string;
  
  role_id: UUID;
  institution_id?: UUID;
  school_id?: UUID;
  is_active?: boolean;
}

export interface UpdateUserDto {
  name?: string;
  email?: Email;
  password?: string;
  cpf?: string;
  phone?: Phone;
  birth_date?: DateString;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  
  // Campos legados para compatibilidade
  telefone?: Phone;
  endereco?: string;
  
  role_id?: UUID;
  institution_id?: UUID;
  school_id?: UUID;
  is_active?: boolean;
}

export interface UserWithRoleDto extends UserDto {
  role_name: string;
  role_description?: string;
  institution_name?: string;
  school_name?: string;
}

// ===== INSTITUTION DTOs =====

export interface InstitutionDto extends BaseEntityDto {
  name: string;
  code: string;
  type: InstitutionType;
  description?: string;
  email?: Email;
  phone?: Phone;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  is_active: boolean;
  
  // Campos computados
  schools_count?: number;
  users_count?: number;
  active_courses?: number;
}

export interface CreateInstitutionDto {
  name: string;
  code: string;
  type: InstitutionType;
  description?: string;
  email?: Email;
  phone?: Phone;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  is_active?: boolean;
}

export interface UpdateInstitutionDto {
  name?: string;
  code?: string;
  type?: InstitutionType;
  description?: string;
  email?: Email;
  phone?: Phone;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  is_active?: boolean;
}

// ===== SCHOOL DTOs =====

export interface SchoolDto extends BaseEntityDto {
  name: string;
  code: string;
  description?: string;
  email?: Email;
  phone?: Phone;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  institution_id: UUID;
  is_active: boolean;
  
  // Campos computados
  users_count?: number;
  classes_count?: number;
}

export interface CreateSchoolDto {
  name: string;
  code: string;
  description?: string;
  email?: Email;
  phone?: Phone;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  institution_id: UUID;
  is_active?: boolean;
}

export interface UpdateSchoolDto {
  name?: string;
  code?: string;
  description?: string;
  email?: Email;
  phone?: Phone;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  institution_id?: UUID;
  is_active?: boolean;
}

// ===== AUTH DTOs =====

export interface LoginDto {
  email: Email;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: Email;
  password: string;
  role_id: UUID;
  institution_id?: UUID;
}

export interface AuthResponseDto {
  user: UserWithRoleDto;
  token: string;
  refresh_token?: string;
  expires_at: DateString;
}

export interface RefreshTokenDto {
  refresh_token: string;
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

export interface ResetPasswordDto {
  token: string;
  new_password: string;
}

export interface ForgotPasswordDto {
  email: Email;
}

// ===== ROLE DTOs =====

export interface RoleDto extends BaseEntityDto {
  name: string;
  description?: string;
  permissions: string[];
  is_active: boolean;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
  permissions: string[];
  is_active?: boolean;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
  is_active?: boolean;
}

// ===== FILTER DTOs =====

export interface UserFilterDto {
  search?: string;
  role_id?: UUID;
  institution_id?: UUID;
  school_id?: UUID;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface InstitutionFilterDto {
  search?: string;
  type?: InstitutionType;
  is_active?: boolean;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SchoolFilterDto {
  search?: string;
  institution_id?: UUID;
  is_active?: boolean;
  city?: string;
  state?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ===== RESPONSE DTOs =====

export type UserResponseDto = ApiResponse<UserDto>;
export type UsersResponseDto = ApiResponse<PaginatedResponse<UserDto>>;
export type UserWithRoleResponseDto = ApiResponse<UserWithRoleDto>;
export type UsersWithRoleResponseDto = ApiResponse<PaginatedResponse<UserWithRoleDto>>;

export type InstitutionResponseDto = ApiResponse<InstitutionDto>;
export type InstitutionsResponseDto = ApiResponse<PaginatedResponse<InstitutionDto>>;

export type SchoolResponseDto = ApiResponse<SchoolDto>;
export type SchoolsResponseDto = ApiResponse<PaginatedResponse<SchoolDto>>;

export type RoleResponseDto = ApiResponse<RoleDto>;
export type RolesResponseDto = ApiResponse<PaginatedResponse<RoleDto>>;

// ===== UTILITÁRIOS DE CONVERSÃO =====

/**
 * Converte campos legados para campos padronizados
 */
export const migrateDtoFields = <T extends Record<string, any>>(dto: T): T => {
  const migrated = { ...dto };

  // Migrar telefone -> phone
  if ('telefone' in migrated) {
    (migrated as any).phone = (migrated as any).telefone;
  }

  // Migrar endereco -> address
  if ('endereco' in migrated) {
    (migrated as any).address = (migrated as any).endereco;
  }

  return migrated;
};

/**
 * Garante compatibilidade com campos legados
 */
export const ensureDtoCompatibility = <T extends Record<string, any>>(dto: T): T => {
  const compatible = { ...dto };

  // Garantir campos legados para compatibilidade
  if ('phone' in compatible) {
    (compatible as any).telefone = (compatible as any).phone;
  }

  if ('address' in compatible) {
    (compatible as any).endereco = (compatible as any).address;
  }

  return compatible;
}; 
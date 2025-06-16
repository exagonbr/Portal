/**
 * Tipos e definições centralizadas para garantir compatibilidade
 * entre frontend e backend
 */

// ===== ENUMS CENTRALIZADOS =====

export enum InstitutionType {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  MIXED = 'MIXED'
}

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ADMIN = 'admin',
  MANAGER = 'manager',
  SYSTEM_ADMIN = 'system_admin',
  INSTITUTION_MANAGER = 'institution_manager',
  ACADEMIC_COORDINATOR = 'academic_coordinator',
  GUARDIAN = 'guardian'
}

export enum UserClassRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  ASSISTANT = 'assistant',
  OBSERVER = 'observer'
}

// ===== TIPOS BASE =====

export type DateString = string; // ISO 8601 format
export type UUID = string;
export type Email = string;
export type Phone = string;

// ===== INTERFACES BASE =====

export interface BaseEntity {
  id: UUID;
  created_at: Date;
  updated_at: Date;
}

export interface BaseEntityDto {
  id: UUID;
  created_at: DateString;
  updated_at: DateString;
}

// ===== ESTRUTURAS DE RESPOSTA PADRONIZADAS =====

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiPaginatedResponse<T = any> extends ApiResponse<PaginatedResponse<T>> {}

// ===== INTERFACES DE CONTATO PADRONIZADAS =====

export interface ContactInfo {
  phone?: Phone;
  email?: Email;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
}

// ===== INTERFACES DE FILTROS PADRONIZADAS =====

export interface BaseFilter {
  search?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ===== LABELS PARA ENUMS =====

export const INSTITUTION_TYPE_LABELS: Record<InstitutionType, string> = {
  [InstitutionType.PUBLIC]: 'Pública',
  [InstitutionType.PRIVATE]: 'Privada',
  [InstitutionType.MIXED]: 'Mista'
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.STUDENT]: 'Aluno',
  [UserRole.TEACHER]: 'Professor',
  [UserRole.ADMIN]: 'Administrador',
  [UserRole.MANAGER]: 'Gestor',
  [UserRole.SYSTEM_ADMIN]: 'Administrador do Sistema',
  [UserRole.INSTITUTION_MANAGER]: 'Gestor da Instituição',
  [UserRole.ACADEMIC_COORDINATOR]: 'Coordenador Acadêmico',
  [UserRole.GUARDIAN]: 'Responsável'
};

export const USER_CLASS_ROLE_LABELS: Record<UserClassRole, string> = {
  [UserClassRole.STUDENT]: 'Aluno',
  [UserClassRole.TEACHER]: 'Professor',
  [UserClassRole.ASSISTANT]: 'Assistente',
  [UserClassRole.OBSERVER]: 'Observador'
};

// ===== VALIDADORES =====

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  return phoneRegex.test(phone);
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// ===== UTILITÁRIOS DE CONVERSÃO =====

export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  return phone;
};

export const formatDate = (date: Date | string): DateString => {
  if (typeof date === 'string') return date;
  return date.toISOString();
};

export const parseDate = (dateString: DateString): Date => {
  return new Date(dateString);
};

export interface PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SelectOption {
  value: string;
  label: string;
}

export type Status = 'active' | 'inactive' | 'pending' | 'suspended';

export const STATUS_LABELS: Record<Status, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  pending: 'Pendente',
  suspended: 'Suspenso'
};

export const STATUS_COLORS: Record<Status, string> = {
  active: 'green',
  inactive: 'gray',
  pending: 'yellow',
  suspended: 'red'
};

/**
 * Interface genérica para resultados de serviços
 */
export interface ServiceResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
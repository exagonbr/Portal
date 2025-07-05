/**
 * Utilitários de validação de tipos em runtime
 * Garante compatibilidade entre frontend e backend
 */

import { 
  InstitutionType, 
  UserRole, 
  UserClassRole,
  isValidEmail,
  isValidPhone,
  isValidUUID,
  ApiResponse,
  PaginatedResponse
} from '../types/common';

// ===== VALIDADORES DE ENUM =====

export const isValidInstitutionType = (value: any): value is InstitutionType => {
  return Object.values(InstitutionType).includes(value);
};

export const isValidUserRole = (value: any): value is UserRole => {
  return Object.values(UserRole).includes(value);
};

export const isValidUserClassRole = (value: any): value is UserClassRole => {
  return Object.values(UserClassRole).includes(value);
};

// ===== VALIDADORES DE ESTRUTURA =====

export const isApiResponse = <T = any>(value: any): value is ApiResponse<T> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.success === 'boolean' &&
    (value.data === undefined || value.data !== null) &&
    (value.message === undefined || typeof value.message === 'string') &&
    (value.errors === undefined || Array.isArray(value.errors))
  );
};

export const isPaginatedResponse = <T = any>(value: any): value is PaginatedResponse<T> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray(value.items) &&
    typeof value.total === 'number' &&
    typeof value.page === 'number' &&
    typeof value.limit === 'number' &&
    typeof value.totalPages === 'number'
  );
};

// ===== VALIDADORES DE DADOS DE USUÁRIO =====

export interface UserValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateUserData = (userData: any): UserValidationResult => {
  const errors: string[] = [];

  // Validações obrigatórias
  if (!userData.name || typeof userData.name !== 'string' || userData.name.trim().length === 0) {
    errors.push('Nome é obrigatório');
  }

  if (!userData.email || !isValidEmail(userData.email)) {
    errors.push('Email válido é obrigatório');
  }

  if (!userData.role_id || !isValidUUID(userData.role_id)) {
    errors.push('Role ID válido é obrigatório');
  }

  // Validações opcionais
  if (userData.phone && !isValidPhone(userData.phone)) {
    errors.push('Formato de telefone inválido');
  }

  if (userData.institution_id && !isValidUUID(userData.institution_id)) {
    errors.push('Institution ID deve ser um UUID válido');
  }

  if (userData.school_id && !isValidUUID(userData.school_id)) {
    errors.push('School ID deve ser um UUID válido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ===== VALIDADORES DE DADOS DE INSTITUIÇÃO =====

export interface InstitutionValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateInstitutionData = (institutionData: any): InstitutionValidationResult => {
  const errors: string[] = [];

  // Validações obrigatórias
  if (!institutionData.name || typeof institutionData.name !== 'string' || institutionData.name.trim().length === 0) {
    errors.push('Nome é obrigatório');
  }

  if (!institutionData.code || typeof institutionData.code !== 'string' || institutionData.code.trim().length === 0) {
    errors.push('Código é obrigatório');
  }

  if (!institutionData.type || !isValidInstitutionType(institutionData.type)) {
    errors.push('Tipo de instituição válido é obrigatório');
  }

  // Validações opcionais
  if (institutionData.email && !isValidEmail(institutionData.email)) {
    errors.push('Email deve ter formato válido');
  }

  if (institutionData.phone && !isValidPhone(institutionData.phone)) {
    errors.push('Telefone deve ter formato válido');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// ===== UTILITÁRIOS DE MIGRAÇÃO DE CAMPOS =====

/**
 * Migra campos legados para novos campos padronizados
 */
export const migrateContactFields = (data: any): any => {
  const migrated = { ...data };

  // Migrar telefone -> phone
  if (migrated.telefone && !migrated.phone) {
    migrated.phone = migrated.telefone;
    delete migrated.telefone;
  }

  // Migrar endereco -> address
  if (migrated.endereco && !migrated.address) {
    migrated.address = migrated.endereco;
    delete migrated.endereco;
  }

  return migrated;
};

/**
 * Garante compatibilidade com campos legados
 */
export const ensureLegacyCompatibility = (data: any): any => {
  const compatible = { ...data };

  // Garantir que campos legados existam para compatibilidade
  if (compatible.phone && !compatible.telefone) {
    compatible.telefone = compatible.phone;
  }

  if (compatible.address && !compatible.endereco) {
    compatible.endereco = compatible.address;
  }

  return compatible;
};

// ===== VALIDADOR DE RESPOSTA DA API =====

export const validateApiResponse = <T = any>(response: any, expectedDataValidator?: (data: any) => boolean): ApiResponse<T> | null => {
  if (!isApiResponse(response)) {
    console.warn('Resposta da API não segue o padrão esperado:', response);
    return null;
  }

  if (expectedDataValidator && response.data && !expectedDataValidator(response.data)) {
    console.warn('Dados da resposta da API não são válidos:', response.data);
    return null;
  }

  return response as ApiResponse<T>;
};

// ===== UTILITÁRIOS DE CONVERSÃO DE TIPOS =====

export const convertStringToDate = (dateString: string | Date): Date => {
  if (dateString instanceof Date) return dateString;
  return new Date(dateString);
};

export const convertDateToString = (date: Date | string): string => {
  if (typeof date === 'string') return date;
  return date.toISOString();
};

// ===== VALIDADOR DE FILTROS =====

export const validateFilterParams = (filters: any): boolean => {
  if (!filters || typeof filters !== 'object') return true;

  // Validar tipos de parâmetros comuns
  if (filters.page !== undefined && (typeof filters.page !== 'number' || filters.page < 1)) {
    return false;
  }

  if (filters.limit !== undefined && (typeof filters.limit !== 'number' || filters.limit < 1 || filters.limit > 100)) {
    return false;
  }

  if (filters.sortOrder !== undefined && !['asc', 'desc'].includes(filters.sortOrder)) {
    return false;
  }

  if (filters.is_active !== undefined && typeof filters.is_active !== 'boolean') {
    return false;
  }

  return true;
}; 
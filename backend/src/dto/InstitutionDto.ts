import { InstitutionType } from '../models/Institution';
import { PaginationResult } from '../types/common';

export interface InstitutionResponseDto {
  id: string;
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
  contract_term_end: Date;
  contract_term_start: Date;
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
  invoice_date?: Date;
  score?: number;
}

export interface UpdateInstitutionDto {
  accountable_contact?: string;
  accountable_name?: string;
  company_name?: string;
  contract_disabled?: boolean;
  contract_term_end?: Date;
  contract_term_start?: Date;
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
  invoice_date?: Date;
  score?: number;
}

// Removido "extends PaginationParams" pois page e limit já estão aqui. Offset é calculado depois.
export interface InstitutionFilterDto {
  search?: string;
  type?: InstitutionType;
  is_active?: boolean;
  page?: number; // Adicionado para clareza, já que vem da query
  limit?: number; // Adicionado para clareza
  sortBy?: keyof InstitutionResponseDto;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedInstitutionDto {
  institution: InstitutionResponseDto[];
  pagination: PaginationResult;
}

export interface InstitutionStatsDto {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalClasses: number;
}
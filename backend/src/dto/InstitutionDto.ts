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

export interface InstitutionDto {
  id: string;
  name: string;
  accountableContact?: string;
  accountableName?: string;
  companyName?: string;
  email?: string;
  contractDisabled?: boolean;
  contractInvoiceNum?: string;
  contractNum?: number;
  contractTermEnd?: Date;
  contractTermStart?: Date;
  dateCreated?: Date;
  disabled?: boolean;
  location?: string;
  phone?: string;
  invoiceDate?: Date;
  lastUpdated?: Date;
  postalCode?: string;
  state?: string;
  street?: string;
  hasLibraryPlatform?: boolean;
  hasPrincipalPlatform?: boolean;
  hasStudentPlatform?: boolean;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateInstitutionDto {
  name: string;
  accountableContact: string;
  accountableName: string;
  companyName: string;
  email: string;
  location: string;
  phone: string;
  postalCode: string;
  state: string;
  street: string;
  contractTermEnd: Date;
  contractTermStart: Date;
  hasLibraryPlatform?: boolean;
  hasPrincipalPlatform?: boolean;
  hasStudentPlatform?: boolean;
}

export interface UpdateInstitutionDto extends Partial<CreateInstitutionDto> {}

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
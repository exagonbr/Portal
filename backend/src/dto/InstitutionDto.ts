import { InstitutionType } from '../models/Institution';
import { PaginationParams, PaginationResult } from '../types/common';

export interface InstitutionDto {
  id: string;
  name: string;
  code: string;
  type: InstitutionType;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  is_active?: boolean; // Tornando opcional para alinhar com o modelo
  created_at: Date;
  updated_at: Date;
}

export interface CreateInstitutionDto {
  name: string;
  code: string;
  type: InstitutionType;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  is_active?: boolean;
}

export interface UpdateInstitutionDto {
  name?: string;
  code?: string;
  type?: InstitutionType;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  is_active?: boolean;
}

// Removido "extends PaginationParams" pois page e limit já estão aqui. Offset é calculado depois.
export interface InstitutionFilterDto {
  search?: string;
  type?: InstitutionType;
  is_active?: boolean;
  page?: number; // Adicionado para clareza, já que vem da query
  limit?: number; // Adicionado para clareza
  sortBy?: keyof InstitutionDto;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedInstitutionsDto {
  institutions: InstitutionDto[];
  pagination: PaginationResult;
}

export interface InstitutionStatsDto {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalClasses: number;
}
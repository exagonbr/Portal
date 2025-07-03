import { PaginationParams, PaginationResult } from '../types/common';

export interface SchoolDto {
  id: string;
  name: string;
  code: string;
  institution_id: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSchoolDto {
  name: string;
  code: string;
  institution_id: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

export interface UpdateSchoolDto {
  name?: string;
  code?: string;
  institution_id?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  is_active?: boolean;
}

export interface SchoolFilterDto extends PaginationParams {
  search?: string;
  institution_id?: string;
  is_active?: boolean;
  city?: string;
  state?: string;
  sortBy?: keyof SchoolDto;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedSchoolsDto {
  schools: SchoolDto[];
  pagination: PaginationResult;
}

export interface SchoolStatsDto {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalManagers: number;
  activeClasses: number;
}
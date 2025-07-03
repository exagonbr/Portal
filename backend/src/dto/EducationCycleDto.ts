import { EducationLevel } from '../models/EducationCycle';
import { PaginationParams, PaginationResult } from '../types/common';

export interface EducationCycleDto {
  id: string;
  name: string;
  level: EducationLevel;
  description?: string;
  duration_years: number;
  min_age?: number;
  max_age?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEducationCycleDto {
  name: string;
  level: EducationLevel;
  description?: string;
  duration_years: number;
  min_age?: number;
  max_age?: number;
}

export interface UpdateEducationCycleDto {
  name?: string;
  level?: EducationLevel;
  description?: string;
  duration_years?: number;
  min_age?: number;
  max_age?: number;
}

export interface EducationCycleFilterDto extends PaginationParams {
  search?: string;
  level?: EducationLevel;
  sortBy?: keyof EducationCycleDto;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedEducationCyclesDto {
  education_cycles: EducationCycleDto[];
  pagination: PaginationResult;
}

export interface ClassEducationCycleDto {
  id: string;
  class_id: string;
  education_cycle_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateClassEducationCycleDto {
  class_id: string;
  education_cycle_id: string;
}

export interface EducationCycleWithClassesDto extends EducationCycleDto {
  classes: Array<{
    id: string;
    name: string;
    code: string;
    school_name: string;
    year: number;
  }>;
  total_students: number;
  total_teachers: number;
}
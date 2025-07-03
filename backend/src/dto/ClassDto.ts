import { ShiftType } from '../models/Class';
import { PaginationParams, PaginationResult } from '../types/common';

export interface ClassDto {
  id: string;
  name: string;
  code: string;
  school_id: string;
  year: number;
  shift: ShiftType;
  max_students: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateClassDto {
  name: string;
  code: string;
  school_id: string;
  year: number;
  shift: ShiftType;
  max_students?: number;
  is_active?: boolean;
}

export interface UpdateClassDto {
  name?: string;
  code?: string;
  school_id?: string;
  year?: number;
  shift?: ShiftType;
  max_students?: number;
  is_active?: boolean;
}

export interface ClassFilterDto extends PaginationParams {
  search?: string;
  school_id?: string;
  year?: number;
  shift?: ShiftType;
  is_active?: boolean;
  sortBy?: keyof ClassDto;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedClassesDto {
  classes: ClassDto[];
  pagination: PaginationResult;
}

export interface ClassStatsDto {
  totalStudents: number;
  totalTeachers: number;
  averageStudents: number;
  occupancyRate: number;
}

export interface ClassWithDetailsDto extends ClassDto {
  school_name: string;
  student_count: number;
  teacher_count: number;
  education_cycles: Array<{
    id: string;
    name: string;
    level: string;
  }>;
}
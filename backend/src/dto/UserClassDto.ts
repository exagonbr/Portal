import { UserClassRole } from '../models/UserClass';
import { PaginationParams, PaginationResult } from '../types/common';

export interface UserClassDto {
  id: string;
  user_id: number;
  class_id: string;
  role: UserClassRole;
  enrollment_date: Date;
  exit_date?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserClassDto {
  user_id: string;
  class_id: string;
  role: UserClassRole;
  enrollment_date?: Date;
  exit_date?: Date;
  is_active?: boolean;
}

export interface UpdateUserClassDto {
  user_id?: string;
  class_id?: string;
  role?: UserClassRole;
  enrollment_date?: Date;
  exit_date?: Date;
  is_active?: boolean;
}

export interface UserClassFilterDto extends PaginationParams {
  user_id?: string;
  class_id?: string;
  role?: UserClassRole;
  is_active?: boolean;
  school_id?: string;
  year?: number;
  sortBy?: keyof UserClassDto;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedUserClassesDto {
  user_classes: UserClassDto[];
  pagination: PaginationResult;
}

export interface UserClassWithDetailsDto extends UserClassDto {
  user_name: string;
  user_email: string;
  class_name: string;
  class_code: string;
  school_name: string;
  school_id: string;
}

export interface ClassEnrollmentSummaryDto {
  class_id: string;
  class_name: string;
  total_students: number;
  total_teachers: number;
  total_coordinators: number;
  active_enrollments: number;
  inactive_enrollments: number;
}

export interface UserEnrollmentHistoryDto {
  user_id: string;
  user_name: string;
  enrollments: Array<{
    class_id: string;
    class_name: string;
    school_name: string;
    role: UserClassRole;
    enrollment_date: Date;
    exit_date?: Date;
    is_active: boolean;
  }>;
}
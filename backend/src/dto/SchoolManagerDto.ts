import { ManagerPosition } from '../models/SchoolManager';
import { PaginationParams, PaginationResult } from '../types/common';

export interface SchoolManagerDto {
  id: string;
  user_id: string;
  school_id: string;
  position: ManagerPosition;
  start_date: Date;
  end_date?: Date;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSchoolManagerDto {
  user_id: string;
  school_id: string;
  position: ManagerPosition;
  start_date?: Date;
  end_date?: Date;
  is_active?: boolean;
}

export interface UpdateSchoolManagerDto {
  user_id?: string;
  school_id?: string;
  position?: ManagerPosition;
  start_date?: Date;
  end_date?: Date;
  is_active?: boolean;
}

export interface SchoolManagerFilterDto extends PaginationParams {
  user_id?: string;
  school_id?: string;
  position?: ManagerPosition;
  is_active?: boolean;
  institution_id?: string;
  sortBy?: keyof SchoolManagerDto;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedSchoolManagersDto {
  school_managers: SchoolManagerDto[];
  pagination: PaginationResult;
}

export interface SchoolManagerWithDetailsDto extends SchoolManagerDto {
  user_name: string;
  user_email: string;
  school_name: string;
  school_code: string;
  institution_name: string;
  institution_id: string;
}

export interface SchoolManagementTeamDto {
  school_id: string;
  school_name: string;
  managers: Array<{
    id: string;
    user_id: string;
    user_name: string;
    user_email: string;
    position: ManagerPosition;
    start_date: Date;
    end_date?: Date;
    is_active: boolean;
  }>;
  principal?: SchoolManagerWithDetailsDto;
  vice_principals: SchoolManagerWithDetailsDto[];
  coordinators: SchoolManagerWithDetailsDto[];
  supervisors: SchoolManagerWithDetailsDto[];
}

export interface ManagerHistoryDto {
  user_id: string;
  user_name: string;
  positions: Array<{
    school_id: string;
    school_name: string;
    institution_name: string;
    position: ManagerPosition;
    start_date: Date;
    end_date?: Date;
    is_active: boolean;
  }>;
}
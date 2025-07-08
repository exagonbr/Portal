import { BaseEntity } from '../types/common';

export interface CreateUnitDto {
  name: string;
  institution_id: string;
  institution_name?: string;
  deleted?: boolean;
}

export interface UpdateUnitDto {
  name?: string;
  institution_id?: string;
  institution_name?: string;
  deleted?: boolean;
}

export interface UnitResponseDto {
  id: string;
  version?: number;
  date_created?: string;
  deleted: boolean;
  institution_id: string;
  last_updated?: string;
  name: string;
  institution_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UnitFilterDto {
  page?: number;
  limit?: number;
  search?: string;
  institution_id?: string;
  deleted?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
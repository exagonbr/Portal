import { BaseEntity } from '../types/common';

export interface CreateUnitDto {
  name: string;
  institution_id: string;
  institution_name?: string;
  type?: string;
  description?: string;
  active?: boolean;
  deleted?: boolean;
}

export interface UpdateUnitDto {
  name?: string;
  institution_id?: string;
  institution_name?: string;
  type?: string;
  description?: string;
  active?: boolean;
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
  type?: string;
  description?: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UnitFilterDto {
  page?: number;
  limit?: number;
  search?: string;
  institution_id?: string;
  type?: string;
  active?: boolean;
  deleted?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
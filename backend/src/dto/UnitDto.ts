import { BaseEntity } from '../types/common';

export interface CreateUnitDto {
  name: string;
  institution_id: string;
  institution_name?: string;
  deleted?: boolean;
  date_created?: Date;
}

export interface UpdateUnitDto {
  name?: string;
  institution_id?: string;
  institution_name?: string;
  deleted?: boolean;
  last_updated?: Date;
}

export interface UnitResponseDto extends BaseEntity {
  id: string;
  version?: number;
  date_created?: string;
  deleted?: boolean;
  institution_id: string;
  last_updated?: string;
  name: string;
  institution_name?: string;
}
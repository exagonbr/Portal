import { BaseEntity } from '../types/common';

export interface CreateUnitClassDto {
  deleted: boolean;
  institution_id: string;
  name: string;
  unit_id: string;
  date_created?: Date;
  institution_name?: string;
  unit_name?: string;
}

export interface UpdateUnitClassDto {
  deleted?: boolean;
  institution_id?: string;
  name?: string;
  unit_id?: string;
  last_updated?: Date;
  institution_name?: string;
  unit_name?: string;
}

export interface UnitClassResponseDto extends BaseEntity {
  id: string;
  version?: number;
  date_created?: string;
  deleted: boolean;
  institution_id: string;
  last_updated?: string;
  name: string;
  unit_id: string;
  institution_name?: string;
  unit_name?: string;
}
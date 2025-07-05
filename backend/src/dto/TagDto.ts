import { BaseEntity } from '../types/common';

export interface CreateTagDto {
  date_created: Date;
  last_updated: Date;
  deleted?: boolean;
  name?: string;
}

export interface UpdateTagDto {
  last_updated: Date;
  deleted?: boolean;
  name?: string;
}

export interface TagResponseDto extends BaseEntity {
  id: string;
  version?: number;
  date_created: string;
  deleted?: boolean;
  last_updated: string;
  name?: string;
}
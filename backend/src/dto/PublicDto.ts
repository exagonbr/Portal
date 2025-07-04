import { BaseEntity } from '../types/common';

export interface CreatePublicDto {
  api_id: number;
  name: string;
}

export interface UpdatePublicDto {
  api_id?: number;
  name?: string;
}

export interface PublicResponseDto extends BaseEntity {
  id: string;
  version?: number;
  api_id: number;
  name: string;
}
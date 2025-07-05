import { BaseEntity } from '../types/common';

export interface CreateTargetAudienceDto {
  description: string;
  name: string;
  is_active?: boolean;
}

export interface UpdateTargetAudienceDto {
  description?: string;
  name?: string;
  is_active?: boolean;
}

export interface TargetAudienceResponseDto extends BaseEntity {
  id: string;
  version?: number;
  description: string;
  is_active?: boolean;
  name: string;
}
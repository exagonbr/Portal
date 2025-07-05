import { BaseEntity } from '../types/common';

export interface CreateEducationPeriodDto {
  description: string;
  is_active?: boolean;
}

export interface UpdateEducationPeriodDto {
  description?: string;
  is_active?: boolean;
}

export interface EducationPeriodResponseDto extends BaseEntity {
  id: string;
  version?: number;
  description: string;
  is_active?: boolean;
}
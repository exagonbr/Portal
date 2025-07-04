import { BaseEntity } from '../types/common';

export interface CreateAuthorDto {
  description: string;
  name: string;
  email?: string;
  is_active?: boolean;
}

export interface UpdateAuthorDto {
  description?: string;
  name?: string;
  email?: string;
  is_active?: boolean;
}

export interface AuthorResponseDto extends BaseEntity {
  id: string;
  version?: number;
  description: string;
  email?: string;
  is_active?: boolean;
  name: string;
}
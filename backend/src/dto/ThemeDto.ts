import { BaseEntity } from '../types/common';

export interface CreateThemeDto {
  description: string;
  name: string;
  is_active?: boolean;
}

export interface UpdateThemeDto {
  description?: string;
  name?: string;
  is_active?: boolean;
}

export interface ThemeResponseDto extends BaseEntity {
  id: string;
  version?: number;
  description: string;
  is_active?: boolean;
  name: string;
}
import { BaseEntity } from '../types/common';

export interface CreateSettingsDto {
  settings_key: string;
  default_value?: string;
  description?: string;
  name?: string;
  required?: boolean;
  settings_type?: string;
  validation_required?: boolean;
  value?: string;
}

export interface UpdateSettingsDto {
  settings_key?: string;
  default_value?: string;
  description?: string;
  name?: string;
  required?: boolean;
  settings_type?: string;
  validation_required?: boolean;
  value?: string;
}

export interface SettingsResponseDto extends BaseEntity {
  id: string;
  version?: number;
  default_value?: string;
  description?: string;
  name?: string;
  required?: boolean;
  settings_key: string;
  settings_type?: string;
  validation_required?: boolean;
  value?: string;
}
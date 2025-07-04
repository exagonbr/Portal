import { BaseFilter } from './common';

// DTO para a entidade Settings, usado no frontend
export interface SettingDto {
  id: number;
  key: string;
  value: any;
  name?: string;
  description?: string;
  type?: string;
  is_public: boolean;
}

// DTO para atualização de Settings
export interface UpdateSettingsDto {
  [key: string]: any;
}

// Interface para filtros de Settings
export interface SettingsFilter extends BaseFilter {
  is_public?: boolean;
  keys?: string[];
}
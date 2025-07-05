import { BaseEntityDto, BaseFilter, UUID } from './common';

// DTO para a entidade Certificate, usado no frontend
export interface CertificateDto extends BaseEntityDto {
  path?: string;
  score?: number;
  tv_show_id?: UUID;
  user_id?: UUID;
  document?: string;
  license_code?: string;
  tv_show_name?: string;
  recreate?: boolean;
}

// DTO para criação de Certificate
export interface CreateCertificateDto {
  path?: string;
  score?: number;
  tv_show_id?: UUID;
  user_id?: UUID;
  document?: string;
  license_code?: string;
  tv_show_name?: string;
  recreate?: boolean;
}

// DTO para atualização de Certificate
export interface UpdateCertificateDto {
  path?: string;
  score?: number;
  tv_show_id?: UUID;
  user_id?: UUID;
  document?: string;
  license_code?: string;
  tv_show_name?: string;
  recreate?: boolean;
}

// Interface para filtros de Certificate
export interface CertificateFilter extends BaseFilter {
  user_id?: UUID;
  tv_show_id?: UUID;
}
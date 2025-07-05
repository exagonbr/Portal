import { BaseEntity } from '../types/common';

export interface CreateCertificateDto {
  date_created: Date;
  path?: string;
  score?: number;
  tv_show_id?: string | null;
  user_id?: string | null;
  document?: string;
  license_code?: string;
  tv_show_name?: string;
  recreate?: boolean;
}

export interface UpdateCertificateDto {
  date_created?: Date;
  last_updated?: Date;
  path?: string;
  score?: number;
  tv_show_id?: string | null;
  user_id?: string | null;
  document?: string;
  license_code?: string;
  tv_show_name?: string;
  recreate?: boolean;
}

export interface CertificateResponseDto extends BaseEntity {
  id: string;
  version?: number;
  date_created: string;
  last_updated?: string;
  path?: string;
  score?: number;
  tv_show_id?: string | null;
  user_id?: string | null;
  document?: string;
  license_code?: string;
  tv_show_name?: string;
  recreate?: boolean;
}
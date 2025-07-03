export interface Certificate {
  id: number;
  version?: number;
  date_created: Date;
  last_updated?: Date;
  path?: string;
  score?: number;
  tv_show_id?: number;
  user_id?: number;
  document?: string;
  license_code?: string;
  tv_show_name?: string;
  recreate?: boolean;
}

export interface CertificateCreateRequest {
  user_id?: number;
  tv_show_id?: number;
  path?: string;
  score?: number;
  document?: string;
  license_code?: string;
  tv_show_name?: string;
  recreate?: boolean;
}

export interface CertificateUpdateRequest {
  path?: string;
  score?: number;
  document?: string;
  license_code?: string;
  tv_show_name?: string;
  recreate?: boolean;
}

export interface CertificateFilters {
  user_id?: number;
  tv_show_id?: number;
  score?: number;
  document?: string;
  license_code?: string;
  tv_show_name?: string;
  recreate?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'date_created' | 'last_updated' | 'score' | 'tv_show_name';
  sort_order?: 'asc' | 'desc';
}

export interface CertificateListResponse {
  success: boolean;
  data: Certificate[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CertificateResponse {
  success: boolean;
  data: Certificate;
}
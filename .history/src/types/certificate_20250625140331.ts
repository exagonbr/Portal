export interface Certificate {
  id: string;
  user_id: string;
  course_id?: string;
  title: string;
  description?: string;
  certificate_type: CertificateType;
  issued_date: string;
  expiry_date?: string;
  certificate_url?: string;
  verification_code: string;
  metadata?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: {
    id: string;
    name: string;
    email: string;
  };
  course?: {
    id: string;
    title: string;
    slug: string;
  };
}

export type CertificateType = 
  | 'COURSE_COMPLETION'
  | 'SKILL_CERTIFICATION'
  | 'PARTICIPATION'
  | 'ACHIEVEMENT';

export interface CertificateCreateRequest {
  user_id: string;
  course_id?: string;
  title: string;
  description?: string;
  certificate_type: CertificateType;
  expiry_date?: string;
  certificate_url?: string;
  metadata?: Record<string, any>;
}

export interface CertificateUpdateRequest {
  title?: string;
  description?: string;
  certificate_type?: CertificateType;
  expiry_date?: string;
  certificate_url?: string;
  metadata?: Record<string, any>;
  is_active?: boolean;
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

export interface CertificateFilters {
  user_id?: string;
  course_id?: string;
  certificate_type?: CertificateType;
  is_active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: 'issued_date' | 'title' | 'created_at';
  sort_order?: 'asc' | 'desc';
}

export const CERTIFICATE_TYPE_LABELS: Record<CertificateType, string> = {
  COURSE_COMPLETION: 'Conclusão de Curso',
  SKILL_CERTIFICATION: 'Certificação de Habilidade',
  PARTICIPATION: 'Participação',
  ACHIEVEMENT: 'Conquista'
};

export const CERTIFICATE_TYPE_COLORS: Record<CertificateType, string> = {
  COURSE_COMPLETION: 'bg-blue-100 text-blue-800',
  SKILL_CERTIFICATION: 'bg-green-100 text-green-800',
  PARTICIPATION: 'bg-yellow-100 text-yellow-800',
  ACHIEVEMENT: 'bg-purple-100 text-purple-800'
};
// Tipos para certificados
export interface Certificate {
  id: number;
  document?: string;
  license_code?: string;
  date_created: string;
  last_updated?: string;
  path?: string;
  score?: number;
  tv_show_id?: string | null;
  user_id?: string | null;
  tv_show_name?: string;
  recreate?: boolean;
  
  // Relacionamentos
  user?: {
    id: number;
    name: string;
    email: string;
  };
  tv_show?: {
    id: number;
    name: string;
  };
}

export interface CertificateFilters {
  search?: string;
  tv_show_name?: string;
  recreate?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Labels e cores para status de certificados
export const CERTIFICATE_STATUS_LABELS: Record<string, string> = {
  'true': 'Recriável',
  'false': 'Não Recriável'
};

export const CERTIFICATE_STATUS_COLORS: Record<string, string> = {
  'true': 'bg-green-100 text-green-800',
  'false': 'bg-gray-100 text-gray-800'
};
export interface PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: any;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface SelectOption {
  value: string;
  label: string;
}

export type Status = 'active' | 'inactive' | 'pending' | 'suspended';

export const STATUS_LABELS: Record<Status, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  pending: 'Pendente',
  suspended: 'Suspenso'
};

export const STATUS_COLORS: Record<Status, string> = {
  active: 'green',
  inactive: 'gray',
  pending: 'yellow',
  suspended: 'red'
};
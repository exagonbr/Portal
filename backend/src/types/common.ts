export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  pagination?: PaginationResult;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface QueryParams extends PaginationParams, SearchParams {}

export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEntityData {
  [key: string]: any;
}

export interface UpdateEntityData {
  [key: string]: any;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
}

export interface RepositoryOptions {
  transaction?: any;
  include?: string[];
  exclude?: string[];
}

export interface ValidationRule {
  field: string;
  rules: string[];
  message?: string;
}

export interface FilterOptions {
  where?: Record<string, any>;
  orderBy?: { field: string; direction: 'asc' | 'desc' }[];
  include?: string[];
  exclude?: string[];
}

export type EntityStatus = 'active' | 'inactive' | 'deleted' | 'pending';

export interface AuditLog {
  id: string;
  entity_type: string;
  entity_id: string;
  action: 'create' | 'update' | 'delete';
  user_id: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  created_at: Date;
}

export interface CacheOptions {
  ttl?: number;
  key?: string;
  tags?: string[];
}

export interface EmailData {
  to: string | string[];
  subject: string;
  template: string;
  data: Record<string, any>;
}

export interface FileUploadData {
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url?: string;
}

export interface BulkOperationResult<T> {
  success: boolean;
  created: T[];
  updated: T[];
  failed: Array<{ data: any; error: string }>;
  total: number;
}
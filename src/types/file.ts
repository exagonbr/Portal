import { BaseFilter } from './common';

// DTO para a entidade File, usado no frontend
export interface FileDto {
  id: number;
  url: string;
  name: string;
  original_name: string;
  content_type: string;
  size: number;
  is_public: boolean;
  created_at: string;
}

// DTO para resposta de upload
export interface FileUploadResponseDto {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

// Interface para filtros de File
export interface FileFilter extends BaseFilter {
  is_public?: boolean;
  content_type?: string;
}
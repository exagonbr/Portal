import { BaseEntityDto, BaseFilter, UUID } from './common';

// DTO para a entidade Book, usado no frontend
export interface BookDto extends BaseEntityDto {
  title: string;
  author: string;
  publisher: string;
  synopsis: string;
  thumbnail?: string;
  url: string;
  s3_key?: string;
  size: number;
  education_level: string;
  cycle?: string;
  grade?: string;
  subject?: string;
  tags: string[];
  uploaded_by: UUID;
}

// DTO para criação de Book
export interface CreateBookDto {
  title: string;
  author: string;
  publisher: string;
  synopsis: string;
  thumbnail?: string;
  url: string;
  s3_key?: string;
  size: number;
  education_level: string;
  cycle?: string;
  grade?: string;
  subject?: string;
  tags?: string[];
  uploaded_by: UUID;
}

// DTO para atualização de Book
export interface UpdateBookDto {
  title?: string;
  author?: string;
  publisher?: string;
  synopsis?: string;
  thumbnail?: string;
  url?: string;
  s3_key?: string;
  size?: number;
  education_level?: string;
  cycle?: string;
  grade?: string;
  subject?: string;
  tags?: string[];
}

// Interface para filtros de Book
export interface BookFilter extends BaseFilter {
  author?: string;
  publisher?: string;
  education_level?: string;
  subject?: string;
  tags?: string;
}
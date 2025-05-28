export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  file_path: string;
  publisher?: string;
  synopsis?: string;
  duration?: string;
  format?: string;
  page_count?: number;
  thumbnail?: string;
  course_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBookData {
  title: string;
  author: string;
  isbn: string;
  file_path: string;
  publisher?: string;
  synopsis?: string;
  duration?: string;
  format?: string;
  page_count?: number;
  thumbnail?: string;
  course_id: string;
}

export interface UpdateBookData {
  title?: string;
  author?: string;
  isbn?: string;
  file_path?: string;
  publisher?: string;
  synopsis?: string;
  duration?: string;
  format?: string;
  page_count?: number;
  thumbnail?: string;
  course_id?: string;
}

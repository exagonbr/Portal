export interface Annotation {
  id: string;
  content: string;
  page_number: number;
  position?: any; // JSON field
  book_id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAnnotationData {
  content: string;
  page_number: number;
  position?: any;
  book_id: string;
  user_id: string;
}

export interface UpdateAnnotationData {
  content?: string;
  page_number?: number;
  position?: any;
  book_id?: string;
  user_id?: string;
}

export interface Highlight {
  id: string;
  content: string;
  page_number: number;
  color: string;
  position?: any; // JSON field
  book_id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateHighlightData {
  content: string;
  page_number: number;
  color: string;
  position?: any;
  book_id: string;
  user_id: string;
}

export interface UpdateHighlightData {
  content?: string;
  page_number?: number;
  color?: string;
  position?: any;
  book_id?: string;
  user_id?: string;
}

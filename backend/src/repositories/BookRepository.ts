import { BaseRepository } from './BaseRepository';

// Interface para desacoplar
export interface Book {
    id: string;
    title: string;
    author: string;
    publisher: string;
    synopsis: string;
    thumbnail?: string;
    url: string;
    s3_key: string;
    size: number;
    education_level: string;
    cycle: string;
    grade: string;
    subject: string;
    tags: string[];
    uploaded_by: string;
    created_at: Date;
    updated_at: Date;
}

export class BookRepository extends BaseRepository<Book> {
  constructor() {
    super('books');
  }
}
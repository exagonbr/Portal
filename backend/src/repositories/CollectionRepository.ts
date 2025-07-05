import { BaseRepository } from './BaseRepository';

// Interface para desacoplar (tabela collections original)
export interface Collection {
    id: string;
    name: string;
    synopsis: string;
    cover_image?: string;
    support_material?: string;
    total_duration: number;
    subject: string;
    tags: string[];
    created_by: string;
    created_at: Date;
    updated_at: Date;
}

// Repository para a tabela collections original (não tv_show)
export class ContentCollectionRepository extends BaseRepository<Collection> {
  constructor() {
    super('collections');
  }
}
import { BaseRepository } from './BaseRepository';

// Interface para desacoplar
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

export class CollectionRepository extends BaseRepository<Collection> {
  constructor() {
    super('collections');
  }
}
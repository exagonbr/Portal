import { BaseRepository } from './BaseRepository';
// Supondo que a entidade Announcement exista
// import { Announcement } from '../entities/Announcement';

// Interface para desacoplar
export interface Announcement {
    id: string;
    title: string;
    content: string;
    author_id: string;
    expires_at: Date;
    priority: 'low' | 'medium' | 'high';
    scope: { type: 'global' | 'institution' | 'school' | 'class', targetId?: string };
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

export class AnnouncementRepository extends BaseRepository<Announcement> {
  constructor() {
    super('announcements');
  }

  // Métodos específicos podem ser adicionados aqui, se necessário.
  async toggleStatus(id: string): Promise<Announcement | null> {
    const announcement = await this.findById(id);
    if (!announcement) return null;
    return this.update(id, { is_active: !announcement.is_active } as Partial<Announcement>);
  }
}
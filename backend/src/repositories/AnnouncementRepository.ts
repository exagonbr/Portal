import { BaseRepository } from './BaseRepository';
import { Announcement } from '../entities/Announcement';

export interface CreateAnnouncementData {
  title: string;
  content: string;
  author_id: number;
  expires_at?: Date;
  priority?: 'baixa' | 'média' | 'alta' | 'urgente';
  scope: {
    type: 'global' | 'turma' | 'curso';
    targetId?: string;
  };
  notifications: {
    email: boolean;
    push: boolean;
  };
  attachments?: any[];
}

export interface UpdateAnnouncementData extends Partial<CreateAnnouncementData> {}

export class AnnouncementRepository extends BaseRepository<Announcement> {
  constructor() {
    super('announcements');
  }

  async toggleStatus(id: string): Promise<Announcement | null> {
    // Para announcements, podemos implementar uma lógica de ativo/inativo
    // ou usar a data de expiração
    const announcement = await this.findById(id);
    if (!announcement) return null;
    
    // Se tem data de expiração, remove ou define uma nova
    const expires_at = announcement.expires_at ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 dias
    return this.update(id, { expires_at });
  }

  async findByAuthor(authorId: number): Promise<Announcement[]> {
    return this.db(this.tableName)
      .where('author_id', authorId)
      .orderBy('created_at', 'desc');
  }

  async findActive(): Promise<Announcement[]> {
    return this.db(this.tableName)
      .where(function() {
        this.whereNull('expires_at').orWhere('expires_at', '>', new Date());
      })
      .orderBy('created_at', 'desc');
  }

  async findByScope(scopeType: 'global' | 'turma' | 'curso', targetId?: string): Promise<Announcement[]> {
    const query = this.db(this.tableName)
      .whereRaw("scope->>'type' = ?", [scopeType]);
    
    if (targetId) {
      query.whereRaw("scope->>'targetId' = ?", [targetId]);
    }
    
    return query.orderBy('created_at', 'desc');
  }
}
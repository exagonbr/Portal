import { BaseRepository } from './BaseRepository';
import { Author } from '../entities/Author';

export class AuthorRepository extends BaseRepository<Author> {
  constructor() {
    super('authors');
  }

  async findByName(name: string): Promise<Author | null> {
    return this.db('authors')
      .where('name', 'ilike', `%${name}%`)
      .where('is_active', true)
      .first();
  }

  async findByEmail(email: string): Promise<Author | null> {
    return this.db('authors')
      .where('email', email)
      .where('is_active', true)
      .first();
  }

  async findByType(type: 'internal' | 'external' | 'guest'): Promise<Author[]> {
    return this.db('authors')
      .where('type', type)
      .where('is_active', true)
      .orderBy('name');
  }

  async searchAuthors(searchTerm: string): Promise<Author[]> {
    return this.db('authors')
      .where('is_active', true)
      .where(function() {
        this.where('name', 'ilike', `%${searchTerm}%`)
          .orWhere('bio', 'ilike', `%${searchTerm}%`)
          .orWhere('specialization', 'ilike', `%${searchTerm}%`);
      })
      .orderBy('name');
  }

  async getAuthorWithContent(authorId: string): Promise<any | null> {
    const author = await this.findById(authorId);
    if (!author) return null;

    const content = await this.db('content_authors as ca')
      .select(
        'ca.content_type',
        'ca.content_id',
        'ca.role',
        'v.name as video_name',
        'v.thumbnail_url as video_thumbnail',
        'ts.title as tvshow_title',
        'ts.cover_image_url as tvshow_cover',
        'c.name as collection_name',
        'b.title as book_title'
      )
      .leftJoin('videos as v', function() {
        this.on('ca.content_id', 'v.id')
          .andOnVal('ca.content_type', 'video');
      })
      .leftJoin('tv_shows as ts', function() {
        this.on('ca.content_id', 'ts.id')
          .andOnVal('ca.content_type', 'tv_show');
      })
      .leftJoin('collections as c', function() {
        this.on('ca.content_id', 'c.id')
          .andOnVal('ca.content_type', 'collection');
      })
      .leftJoin('books as b', function() {
        this.on('ca.content_id', 'b.id')
          .andOnVal('ca.content_type', 'book');
      })
      .where('ca.author_id', authorId)
      .orderBy('ca.order_index');

    return {
      ...author,
      content
    };
  }

  async getContentAuthors(contentId: string, contentType: string): Promise<any[]> {
    return this.db('content_authors as ca')
      .select(
        'a.*',
        'ca.role',
        'ca.order_index'
      )
      .join('authors as a', 'ca.author_id', 'a.id')
      .where('ca.content_id', contentId)
      .where('ca.content_type', contentType)
      .where('a.is_active', true)
      .orderBy('ca.order_index');
  }

  async addContentAuthor(
    authorId: string,
    contentId: string,
    contentType: string,
    role: string = 'creator',
    orderIndex: number = 0
  ): Promise<void> {
    await this.db('content_authors').insert({
      author_id: authorId,
      content_id: contentId,
      content_type: contentType,
      role,
      order_index: orderIndex
    });
  }

  async removeContentAuthor(
    authorId: string,
    contentId: string,
    contentType: string
  ): Promise<void> {
    await this.db('content_authors')
      .where('author_id', authorId)
      .where('content_id', contentId)
      .where('content_type', contentType)
      .del();
  }

  async getPopularAuthors(limit: number = 10): Promise<any[]> {
    return this.db('authors as a')
      .select(
        'a.*',
        this.db.raw('COUNT(ca.id) as content_count')
      )
      .leftJoin('content_authors as ca', 'a.id', 'ca.author_id')
      .where('a.is_active', true)
      .groupBy('a.id')
      .orderBy('content_count', 'desc')
      .limit(limit);
  }
} 
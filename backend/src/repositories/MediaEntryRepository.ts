import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { MediaEntry } from '../entities/MediaEntry';

export interface CreateMediaEntryData {
  name?: string;
  description?: string;
  isbn?: string;
  yearOfPublication?: number;
  authorId?: number;
  publisherId?: number;
  genreId?: number;
  languageId?: number;
  subjectId?: number;
  educationPeriodId?: number;
  educationalStageId?: number;
  enabled?: boolean;
  deleted?: boolean;
  isActive?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  isRecommended?: boolean;
  tags?: string;
  keywords?: string;
  category?: string;
  subcategory?: string;
  type?: string;
  format?: string;
  duration?: string;
  pages?: string;
  size?: string;
  url?: string;
  thumbnail?: string;
  cover?: string;
  preview?: string;
  price?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  downloads?: number;
  likes?: number;
  shares?: number;
  comments?: number;
  amountOfViews?: number;
}

export interface UpdateMediaEntryData extends Partial<CreateMediaEntryData> {}

export class MediaEntryRepository extends ExtendedRepository<MediaEntry> {
  constructor() {
    super('media_entry');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<MediaEntry>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('mediaentry');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('mediaentry.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('mediaentry.id', 'DESC')
          .getManyAndCount();
          
        return {
          data,
          total,
          page,
          limit
        };
      } else {
        // Fallback para query raw
        const query = `
          SELECT * FROM mediaentry
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM mediaentry
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
        `;

        const [data, countResult] = await Promise.all([
          AppDataSource.query(query),
          AppDataSource.query(countQuery)
        ]);

        const total = parseInt(countResult[0].total);

        return {
          data,
          total,
          page,
          limit
        };
      }
    } catch (error) {
      console.error(`Erro ao buscar registros de mediaentry:`, error);
      throw error;
    }
  }

  async toggleStatus(id: string): Promise<MediaEntry | null> {
    const mediaEntry = await this.findById(id);
    if (!mediaEntry) return null;
    
    return this.update(id, { isActive: !mediaEntry.isActive });
  }

  async findByName(name: string): Promise<MediaEntry[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .andWhere('deleted', false)
      .orderBy('name', 'asc');
  }

  async findActive(): Promise<MediaEntry[]> {
    return this.db(this.tableName)
      .where('is_active', true)
      .andWhere('deleted', false)
      .orderBy('name', 'asc');
  }

  async findByAuthor(authorId: number): Promise<MediaEntry[]> {
    return this.db(this.tableName)
      .where('author_id', authorId)
      .andWhere('deleted', false)
      .orderBy('name', 'asc');
  }

  async findByPublisher(publisherId: number): Promise<MediaEntry[]> {
    return this.db(this.tableName)
      .where('publisher_id', publisherId)
      .andWhere('deleted', false)
      .orderBy('name', 'asc');
  }

  async findByGenre(genreId: number): Promise<MediaEntry[]> {
    return this.db(this.tableName)
      .where('genre_id', genreId)
      .andWhere('deleted', false)
      .orderBy('name', 'asc');
  }

  async findBySubject(subjectId: number): Promise<MediaEntry[]> {
    return this.db(this.tableName)
      .where('subject_id', subjectId)
      .andWhere('deleted', false)
      .orderBy('name', 'asc');
  }

  async findFeatured(): Promise<MediaEntry[]> {
    return this.db(this.tableName)
      .where('is_featured', true)
      .andWhere('deleted', false)
      .orderBy('name', 'asc');
  }

  async findPopular(): Promise<MediaEntry[]> {
    return this.db(this.tableName)
      .where('is_popular', true)
      .andWhere('deleted', false)
      .orderBy('amount_of_views', 'desc');
  }

  async findNew(): Promise<MediaEntry[]> {
    return this.db(this.tableName)
      .where('is_new', true)
      .andWhere('deleted', false)
      .orderBy('date_created', 'desc');
  }

  async findRecommended(): Promise<MediaEntry[]> {
    return this.db(this.tableName)
      .where('is_recommended', true)
      .andWhere('deleted', false)
      .orderBy('rating', 'desc');
  }

  async search(term: string): Promise<MediaEntry[]> {
    return this.db(this.tableName)
      .where(function() {
        this.where('name', 'ilike', `%${term}%`)
          .orWhere('description', 'ilike', `%${term}%`)
          .orWhere('tags', 'ilike', `%${term}%`)
          .orWhere('keywords', 'ilike', `%${term}%`);
      })
      .andWhere('deleted', false)
      .orderBy('name', 'asc');
  }

  async incrementViews(id: string): Promise<void> {
    await this.db(this.tableName)
      .where('id', id)
      .increment('amount_of_views', 1);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.update(id, { deleted: true });
    return !!result;
  }
} 
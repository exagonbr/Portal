import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
// Supondo que as entidades Annotation e Highlight existam
// import { Annotation, Highlight } from '../entities/Annotation';

// Interfaces para desacoplar
export interface Annotation {
    id: string;
    book_id: string;
    user_id: string;
    page_number: number;
    content: string;
    created_at: Date;
    updated_at: Date;
}

export interface Highlight {
    id: string;
    book_id: string;
    user_id: string;
    page_number: number;
    content: string;
    color: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateAnnotationData extends Omit<Annotation, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateAnnotationData extends Partial<CreateAnnotationData> {}

export interface CreateHighlightData extends Omit<Highlight, 'id' | 'created_at' | 'updated_at'> {}
export interface UpdateHighlightData extends Partial<CreateHighlightData> {}


export class AnnotationRepository extends ExtendedRepository<Annotation> {
  constructor() {
    super('annotations');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Annotation>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('annotation');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('annotation.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('annotation.id', 'DESC')
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
          SELECT * FROM annotation
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM annotation
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
      console.error(`Erro ao buscar registros de annotation:`, error);
      throw error;
    }
  }

  async findByBook(bookId: string, userId?: string): Promise<Annotation[]> {
    let query = this.db(this.tableName).where({ book_id: bookId });
    if (userId) {
      query = query.andWhere({ user_id: userId });
    }
    return query.orderBy('page_number', 'asc').orderBy('created_at', 'asc');
  }

  async findByUser(userId: string): Promise<Annotation[]> {
    return this.findAll({ user_id: userId } as Partial<Annotation>);
  }

  async findByPage(bookId: string, pageNumber: number, userId?: string): Promise<Annotation[]> {
    let query = this.db(this.tableName).where({ book_id: bookId, page_number: pageNumber });
     if (userId) {
      query = query.andWhere({ user_id: userId });
    }
    return query.orderBy('created_at', 'asc');
  }
  
  async search(userId: string, term: string): Promise<Annotation[]> {
      return this.db(this.tableName)
        .where({ user_id: userId })
        .andWhere('content', 'ilike', `%${term}%`);
  }
}

export class HighlightRepository extends BaseRepository<Highlight> {
  constructor() {
    super('highlights');
  }

  async findByBook(bookId: string, userId?: string): Promise<Highlight[]> {
    let query = this.db(this.tableName).where({ book_id: bookId });
    if (userId) {
      query = query.andWhere({ user_id: userId });
    }
    return query.orderBy('page_number', 'asc').orderBy('created_at', 'asc');
  }

  async findByUser(userId: string): Promise<Highlight[]> {
    return this.findAll({ user_id: userId } as Partial<Highlight>);
  }

  async findByPage(bookId: string, pageNumber: number, userId?: string): Promise<Highlight[]> {
    let query = this.db(this.tableName).where({ book_id: bookId, page_number: pageNumber });
     if (userId) {
      query = query.andWhere({ user_id: userId });
    }
    return query.orderBy('created_at', 'asc');
  }
  
  async findByColor(color: string, userId: string): Promise<Highlight[]> {
    return this.db(this.tableName).where({ user_id: userId, color: color });
  }
  
  async search(userId: string, term: string): Promise<Highlight[]> {
      return this.db(this.tableName)
        .where({ user_id: userId })
        .andWhere('content', 'ilike', `%${term}%`);
  }
}
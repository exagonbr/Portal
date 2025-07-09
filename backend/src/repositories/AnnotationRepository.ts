import { Repository } from "typeorm";
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
    super("annotations");
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Annotation>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      // Usar diretamente o db e tableName herdados da classe base
      let query = this.db(this.tableName).select("*");

      // Adicione condições de pesquisa específicas para esta entidade
      if (search) {
        query = query.whereILike("name", `%${search}%`);
      }

      // Executar a consulta paginada
      const offset = (page - 1) * limit;
      const data = await query
        .orderBy("id", "DESC")
        .limit(limit)
        .offset(offset);

      // Contar o total de registros
      const countResult = await this.db(this.tableName)
        .count("* as total")
        .modify(qb => {
          if (search) {
            qb.whereILike("name", `%${search}%`);
          }
        })
        .first();

      const total = parseInt(countResult?.total as string, 10) || 0;

      return {
        data,
        total,
        page,
        limit
      };
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
    super("annotations");
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

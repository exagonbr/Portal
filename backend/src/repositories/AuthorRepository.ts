import { Repository } from "typeorm";
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Author } from '../entities/Author';

export interface CreateAuthorData {
  name: string;
  description: string;
  email?: string;
  isActive?: boolean;
}

export interface UpdateAuthorData extends Partial<CreateAuthorData> {}

export class AuthorRepository extends ExtendedRepository<Author> {
  constructor() {
    super("authors");
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Author>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      // Usar diretamente o db e tableName herdados da classe base
      let query = this.db(this.tableName).select('*');
      
      // Adicione condições de pesquisa específicas para esta entidade
      if (search) {
        query = query.whereILike('name', `%${search}%`);
      }
      
      // Executar a consulta paginada
      const offset = (page - 1) * limit;
      const data = await query
        .orderBy('id', 'DESC')
        .limit(limit)
        .offset(offset);
      
      // Contar o total de registros
      const countResult = await this.db(this.tableName)
        .count('* as total')
        .modify(qb => {
          if (search) {
            qb.whereILike('name', `%${search}%`);
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
    } catch (error) {
      console.error(`Erro ao buscar registros de author:`, error);
      throw error;
    }
  }

  async toggleStatus(id: string): Promise<Author | null> {
    const author = await this.findById(id);
    if (!author) return null;
    
    const updatedAuthor = await this.update(id, { isActive: !author.isActive });
    return updatedAuthor;
  }

  async findByName(name: string): Promise<Author[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .andWhere('is_active', true);
  }

  async findActive(): Promise<Author[]> {
    return this.db(this.tableName)
      .where('is_active', true)
      .orderBy('name', 'asc');
  }
}
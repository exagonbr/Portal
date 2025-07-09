import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Theme } from '../entities/Theme';

export interface CreateThemeData {
  name: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateThemeData extends Partial<CreateThemeData> {}

export class ThemeRepository extends ExtendedRepository<Theme> {
  constructor() {
    super("themes");
  }
  
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Theme>> {
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
    } catch (error) {
      console.error(`Erro ao buscar registros de temas:`, error);
      throw error;
    }
  }

  async toggleStatus(id: string): Promise<Theme | null> {
    try {
      const theme = await this.findById(id);
      if (!theme) return null;
      
      return this.update(id, { isActive: !theme.isActive });
    } catch (error) {
      console.error(`Erro ao alternar status do tema:`, error);
      throw error;
    }
  }

  async findByName(name: string): Promise<Theme[]> {
    try {
      return this.db(this.tableName)
        .where('name', 'ilike', `%${name}%`)
        .orderBy('name', 'asc');
    } catch (error) {
      console.error(`Erro ao buscar temas por nome:`, error);
      throw error;
    }
  }

  async findActive(): Promise<Theme[]> {
    try {
      return this.db(this.tableName)
        .where('is_active', true)
        .orderBy('name', 'asc');
    } catch (error) {
      console.error(`Erro ao buscar temas ativos:`, error);
      throw error;
    }
  }
} 

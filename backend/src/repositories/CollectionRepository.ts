import { AppDataSource } from "../config/typeorm.config";
import { Repository } from "typeorm";
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';


// Interface para desacoplar (tabela collections original)
export interface ICollection {
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
export class ContentCollectionRepository extends ExtendedRepository<ICollection> {
  constructor() {
    super("collections");
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<ICollection>> {
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
      console.error("Error in findAllPaginated:", error);
      throw error;
    }
  }
}

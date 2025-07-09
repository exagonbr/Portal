import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Public } from '../entities/Public';
import { AppDataSource } from '../config/typeorm.config';
import { Repository } from 'typeorm';

export interface CreatePublicData {
  name: string;
  apiId: number;
}

export interface UpdatePublicData extends Partial<CreatePublicData> {}

export class PublicRepository extends ExtendedRepository<Public> {
  private repository: Repository<Public>;
  constructor() {
    super("publics");
    this.repository = AppDataSource.getRepository(Public);
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Public>> {
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
      console.error(`Erro ao buscar registros de public:`, error);
      throw error;
    }
  }

  async findByName(name: string): Promise<Public[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .orderBy('name', 'asc');
  }

  async findByApiId(apiId: number): Promise<Public | null> {
    return this.db(this.tableName)
      .where('api_id', apiId)
      .first();
  }
} 

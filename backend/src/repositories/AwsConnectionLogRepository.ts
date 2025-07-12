import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { AwsConnectionLog } from '../types/aws'; // Importando apenas a interface

export interface CreateAwsConnectionLogDto extends Omit<AwsConnectionLog, 'id' | 'created_at' | 'updated_at'> {}

export class AwsConnectionLogRepository extends ExtendedRepository<AwsConnectionLog> {
  constructor() {
    super("awsconnectionlogs");
  }
  
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<AwsConnectionLog>> {
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
      console.error("Erro ao buscar logs de conexão AWS paginados:", error);
      throw error;
    }
  }

  async createLog(data: CreateAwsConnectionLogDto): Promise<AwsConnectionLog> {
    return this.create(data);
  }

  async findBySettings(awsSettingsId: string, limit: number = 50, offset: number = 0): Promise<AwsConnectionLog[]> {
    return this.db(this.tableName)
      .where({ aws_settings_id: awsSettingsId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async findByUser(userId: string, limit: number = 50, offset: number = 0): Promise<AwsConnectionLog[]> {
    return this.db(this.tableName)
      .where({ user_id: userId })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async findByService(service: string, limit: number = 50, offset: number = 0): Promise<AwsConnectionLog[]> {
    return this.db(this.tableName)
      .where({ service })
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }
  
  async findFailures(awsSettingsId?: string, limit: number = 50): Promise<AwsConnectionLog[]> {
    let query = this.db(this.tableName).where({ success: false });
    if (awsSettingsId) {
        query = query.andWhere({ aws_settings_id: awsSettingsId });
    }
    return query.orderBy('created_at', 'desc').limit(limit);
  }
}

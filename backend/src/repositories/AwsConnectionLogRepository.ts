import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { AwsConnectionLog } from '../types/aws'; // Supondo que os tipos AWS estejam definidos

export interface CreateAwsConnectionLogDto extends Omit<AwsConnectionLog, 'id' | 'created_at' | 'updated_at'> {}

export class AwsConnectionLogRepository extends ExtendedRepository<AwsConnectionLog> {
  constructor() {
    super('aws_connection_logs');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<AwsConnectionLog>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('awsconnectionlog');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('awsconnectionlog.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('awsconnectionlog.id', 'DESC')
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
          SELECT * FROM awsconnectionlog
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM awsconnectionlog
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
      console.error(`Erro ao buscar registros de awsconnectionlog:`, error);
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
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { AwsSettings } from '../types/aws'; // Supondo que os tipos AWS estejam definidos

export interface CreateAwsSettingsDto extends Omit<AwsSettings, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'> {}
export interface UpdateAwsSettingsDto extends Partial<CreateAwsSettingsDto> {}

export class AwsSettingsRepository extends ExtendedRepository<AwsSettings> {
  constructor() {
    super('aws_settings');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<AwsSettings>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('awssettings');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('awssettings.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('awssettings.id', 'DESC')
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
          SELECT * FROM awssettings
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM awssettings
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
      console.error(`Erro ao buscar registros de awssettings:`, error);
      throw error;
    }
  }

  async findActive(): Promise<AwsSettings | null> {
    return this.findOne({ is_active: true } as Partial<AwsSettings>);
  }

  async createSettings(data: CreateAwsSettingsDto, userId: string): Promise<AwsSettings> {
    // Desativa outras configurações ativas
    await this.db(this.tableName).where({ is_active: true }).update({ is_active: false });
    
    const settingsData = {
        ...data,
        is_active: true,
        created_by: userId,
        updated_by: userId,
    };
    return this.create(settingsData);
  }

  async updateSettings(id: string, data: UpdateAwsSettingsDto, userId: string): Promise<AwsSettings | null> {
    const updateData = {
        ...data,
        updated_by: userId,
    };
    return this.update(id, updateData);
  }

  async setActive(id: string, userId: string): Promise<AwsSettings | null> {
    await this.db(this.tableName).where({ is_active: true }).update({ is_active: false, updated_by: userId });
    return this.update(id, { is_active: true, updated_by: userId } as Partial<AwsSettings>);
  }
}
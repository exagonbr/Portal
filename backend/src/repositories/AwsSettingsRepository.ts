import { Repository } from "typeorm";
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { AwsSettings } from '../types/aws'; // Supondo que os tipos AWS estejam definidos

export interface CreateAwsSettingsDto extends Omit<AwsSettings, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'> {}
export interface UpdateAwsSettingsDto extends Partial<CreateAwsSettingsDto> {}

export class AwsSettingsRepository extends ExtendedRepository<AwsSettings> {
  constructor() {
    super("awssettingss");
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<AwsSettings>> {
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

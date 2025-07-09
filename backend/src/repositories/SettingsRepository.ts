import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Settings } from '../entities/Settings';

export class SettingsRepository extends ExtendedRepository<Settings> {
  private repository: Repository<Settings>;
  constructor() {
    super("settingss");
    this.repository = AppDataSource.getRepository(Settings);
  }
  
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Settings>> {
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
      console.error(`Erro ao buscar registros de configurações:`, error);
      throw error;
    }
  }

  async findByKey(key: string): Promise<Settings | null> {
    return this.findOne({ settingsKey: key } as Partial<Settings>);
  }

  async getValue(key: string, defaultValue: any = null): Promise<any> {
    const setting = await this.findByKey(key);
    if (setting && setting.value) {
        try {
            // Tenta fazer o parse do JSON, se falhar, retorna o valor como string
            return JSON.parse(setting.value);
        } catch (e) {
            return setting.value;
        }
    }
    return defaultValue;
  }

  async setValue(key: string, value: any): Promise<Settings> {
    const existing = await this.findByKey(key);
    const valueString = typeof value === 'string' ? value : JSON.stringify(value);

    if (existing) {
      return this.update(existing.id, { value: valueString } as Partial<Settings>).then(res => res!);
    } else {
      return this.create({ settingsKey: key, value: valueString } as Partial<Settings>);
    }
  }
}

import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Settings } from '../entities/Settings';

export class SettingsRepository extends ExtendedRepository<Settings> {
  constructor() {
    super('settings');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Settings>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('settings');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('settings.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('settings.id', 'DESC')
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
          SELECT * FROM settings
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM settings
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
      console.error(`Erro ao buscar registros de settings:`, error);
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
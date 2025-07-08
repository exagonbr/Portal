import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Module } from '../entities/Module';

export interface CreateModuleData extends Omit<Module, 'id' | 'created_at' | 'updated_at' | 'collection' | 'videos'> {}
export interface UpdateModuleData extends Partial<CreateModuleData> {}

export class ModuleRepository extends ExtendedRepository<Module> {
  constructor() {
    super('modules');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Module>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('module');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('module.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('module.id', 'DESC')
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
          SELECT * FROM module
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM module
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
      console.error(`Erro ao buscar registros de module:`, error);
      throw error;
    }
  }

  async createModule(data: CreateModuleData): Promise<Module> {
    return this.create(data);
  }

  async updateModule(id: string, data: UpdateModuleData): Promise<Module | null> {
    return this.update(id, data);
  }

  async deleteModule(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async findByCollection(collectionId: string): Promise<Module[]> {
    return this.db(this.tableName)
      .where('collection_id', collectionId)
      .orderBy('order', 'asc');
  }

  async getNextOrder(collectionId: string): Promise<number> {
    const result = await this.db(this.tableName)
      .where('collection_id', collectionId)
      .max('order as max_order')
      .first();

    return (result?.max_order || 0) + 1;
  }

  async reorderModules(collectionId: string, moduleOrders: { id: string; order: number }[]): Promise<void> {
    await this.executeTransaction(async (trx) => {
      for (const moduleOrder of moduleOrders) {
        await trx(this.tableName)
          .where({ id: moduleOrder.id, collection_id: collectionId })
          .update({ order: moduleOrder.order });
      }
    });
  }
}
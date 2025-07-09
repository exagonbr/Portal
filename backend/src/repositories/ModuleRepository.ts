import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Module } from '../entities/Module';

export interface CreateModuleData extends Omit<Module, 'id' | 'created_at' | 'updated_at' | 'collection' | 'videos'> {}
export interface UpdateModuleData extends Partial<CreateModuleData> {}

export class ModuleRepository extends ExtendedRepository<Module> {

  constructor() {
    super("modules");
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Module>> {
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

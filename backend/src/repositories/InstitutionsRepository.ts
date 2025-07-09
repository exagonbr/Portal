import { AppDataSource } from "../config/typeorm.config";
import { Repository } from "typeorm";
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Institution } from '../entities/Institutions';

export class InstitutionsRepository extends ExtendedRepository<Institution> {
  private repository: Repository<Institution>;
  constructor() {
    super("institution");
    this.repository = AppDataSource.getRepository(Institution);
  }
  
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Institution>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      // Usar diretamente o db e tableName herdados da classe base
      let query = this.db(this.tableName).select('*');
      
      // Adicione condições de pesquisa específicas para esta entidade
      if (search) {
        query = query.whereILike('name', `%${search}%`);
      }
      
      // Executar a consulta paginada
      const offset = (page - 1) * limit;
      const data = await query
        .orderBy('id', 'DESC')
        .limit(limit)
        .offset(offset);
      
      // Contar o total de registros
      const countResult = await this.db(this.tableName)
        .count('* as total')
        .modify(qb => {
          if (search) {
            qb.whereILike('name', `%${search}%`);
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
      console.error(`Erro ao buscar registros de institutions:`, error);
      throw error;
    }
  }

  async findById(id: number): Promise<Institution | null> {
    try {
      const result = await this.db(this.tableName).where({ id }).first();
      return result || null;
    } catch (error) {
      console.error(`Erro ao buscar registro por ID em institutions:`, error);
      throw error;
    }
  }

  async create(data: Partial<Institution>): Promise<Institution> {
    try {
      const result = await this.db(this.tableName).insert(data).returning('*');
      return result[0];
    } catch (error) {
      console.error(`Erro ao criar registro em institutions:`, error);
      throw error;
    }
  }

  async update(id: number, data: Partial<Institution>): Promise<Institution | null> {
    try {
      const result = await this.db(this.tableName)
        .where({ id })
        .update({ ...data, updatedAt: new Date() })
        .returning('*');
      return result[0] || null;
    } catch (error) {
      console.error(`Erro ao atualizar registro em institutions:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const result = await this.db(this.tableName).where({ id }).del();
      return result > 0;
    } catch (error) {
      console.error(`Erro ao deletar registro em institutions:`, error);
      throw error;
    }
  }
}

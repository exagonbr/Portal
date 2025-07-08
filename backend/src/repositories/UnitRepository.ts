import { BaseRepository } from './BaseRepository';
import { Unit } from '../entities/Unit';

export interface CreateUnitData {
  name: string;
  institutionId: number;
  institutionName?: string;
  type?: string;
  description?: string;
  status?: string;
  deleted?: boolean;
  dateCreated?: Date;
  lastUpdated?: Date;
}

export interface UpdateUnitData extends Partial<CreateUnitData> {}

export interface UnitFilters {
  search?: string;
  institution_id?: number;
  type?: string;
  active?: boolean;
  deleted?: boolean;
  page?: number;
  limit?: number;
  sortBy?: keyof Unit;
  sortOrder?: 'asc' | 'desc';
}

export class UnitRepository extends BaseRepository<Unit> {
  constructor() {
    super('unit');
  }

  /**
   * Buscar unidades por nome com termo de pesquisa
   */
  async findByName(name: string, limit: number = 10): Promise<Unit[]> {
    return this.db(this.tableName)
      .where('name', 'ilike', `%${name}%`)
      .andWhere('deleted', false)
      .andWhere('status', 'active')
      .orderBy('name', 'asc')
      .limit(limit);
  }

  /**
   * Buscar unidade específica por nome e instituição (para verificar duplicatas)
   */
  async findByNameAndInstitution(name: string, institutionId: number): Promise<Unit | null> {
    const result = await this.db(this.tableName)
      .where('name', 'ilike', name)
      .andWhere('institution_id', institutionId)
      .first();
    
    return result || null;
  }

  /**
   * Buscar unidades por instituição
   */
  async findByInstitution(institutionId: number, includeInactive: boolean = false): Promise<Unit[]> {
    const query = this.db(this.tableName)
      .where('institution_id', institutionId);

    if (!includeInactive) {
      query.andWhere('deleted', false)
           .andWhere('status', 'active');
    }

    return query.orderBy('name', 'asc');
  }

  /**
   * Buscar apenas unidades ativas
   */
  async findActive(limit: number = 100): Promise<Unit[]> {
    return this.db(this.tableName)
      .where('deleted', false)
      .andWhere('status', 'active')
      .orderBy('name', 'asc')
      .limit(limit);
  }

  /**
   * Soft delete - marcar como excluída
   */
  async softDelete(id: string): Promise<boolean> {
    const result = await this.update(id, { 
      deleted: true, 
      lastUpdated: new Date() 
    } as UpdateUnitData);
    return !!result;
  }

  /**
   * Buscar unidades com filtros e paginação
   */
  async findWithFilters(filters: UnitFilters): Promise<{ data: Unit[], total: number }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc',
      search,
      institution_id,
      type,
      active,
      deleted
    } = filters;

    // Query principal para buscar dados
    const query = this.db(this.tableName).select('*');
    
    // Query para contar total
    const countQuery = this.db(this.tableName).count('* as total').first();

    // Aplicar filtros em ambas as queries
    const applyFilters = (q: any) => {
      // Filtro de busca por texto
      if (search) {
        q.where(function(this: any) {
          this.where('name', 'ilike', `%${search}%`)
              .orWhere('institution_name', 'ilike', `%${search}%`)
              .orWhere('description', 'ilike', `%${search}%`);
        });
      }

      // Filtro por instituição
      if (institution_id !== undefined) {
        q.where('institution_id', institution_id);
      }

      // Filtro por tipo
      if (type) {
        q.where('type', 'ilike', type);
      }

      // Filtro por status ativo
      if (active !== undefined) {
        if (active) {
          q.where('status', 'active').andWhere('deleted', false);
        } else {
          q.where(function(this: any) {
            this.where('status', '!=', 'active').orWhere('deleted', true);
          });
        }
      }

      // Filtro por status excluído
      if (deleted !== undefined) {
        q.where('deleted', deleted);
      }

      return q;
    };

    applyFilters(query);
    applyFilters(countQuery);
    
    // Aplicar ordenação e paginação na query principal
    const validSortColumns = ['id', 'name', 'institution_name', 'type', 'status', 'date_created', 'last_updated'];
    const safeSortBy = validSortColumns.includes(sortBy as string) ? sortBy : 'name';
    
    query
      .orderBy(safeSortBy as string, sortOrder)
      .limit(limit)
      .offset((page - 1) * limit);

    // Executar ambas as queries em paralelo
    const [data, totalResult] = await Promise.all([query, countQuery]);
    
    const total = totalResult ? parseInt(totalResult.total as string, 10) : 0;

    return { data, total };
  }

  /**
   * Alternar status da unidade (ativa/inativa)
   */
  async toggleStatus(id: string): Promise<Unit | null> {
    try {
      const unit = await this.findById(id);
      if (!unit) {
        return null;
      }

      const newStatus = unit.status === 'active' ? 'inactive' : 'active';
      const updatedUnit = await this.update(id, { 
        status: newStatus,
        lastUpdated: new Date()
      } as UpdateUnitData);
      
      return updatedUnit;
    } catch (error) {
      console.error('Erro ao alternar status da Unit:', error);
      throw error;
    }
  }

  /**
   * Sobrescrever o método create para incluir timestamps automaticamente
   */
  async create(data: CreateUnitData): Promise<Unit> {
    const now = new Date();
    const unitData = {
      ...data,
      date_created: data.dateCreated || now,
      last_updated: data.lastUpdated || now,
      deleted: data.deleted || false,
      status: data.status || 'active'
    };

    const [result] = await this.db(this.tableName)
      .insert(unitData)
      .returning('*');
    
    return result;
  }

  /**
   * Sobrescrever o método update para incluir timestamp de atualização
   */
  async update(id: string | number, data: UpdateUnitData): Promise<Unit | null> {
    const updateData = {
      ...data,
      last_updated: new Date()
    };

    const [result] = await this.db(this.tableName)
      .where('id', id)
      .update(updateData)
      .returning('*');
    
    return result || null;
  }

  /**
   * Buscar estatísticas das unidades
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: { type: string; count: number }[];
    byInstitution: { institution_id: number; institution_name: string; count: number }[];
  }> {
    const [totalResult, activeResult, inactiveResult, byTypeResult, byInstitutionResult] = await Promise.all([
      this.db(this.tableName).count('* as count').first(),
      this.db(this.tableName).where('deleted', false).andWhere('status', 'active').count('* as count').first(),
      this.db(this.tableName).where(function(this: any) {
        this.where('deleted', true).orWhere('status', '!=', 'active');
      }).count('* as count').first(),
      this.db(this.tableName)
        .select('type')
        .count('* as count')
        .whereNotNull('type')
        .groupBy('type')
        .orderBy('count', 'desc'),
      this.db(this.tableName)
        .select('institution_id', 'institution_name')
        .count('* as count')
        .groupBy('institution_id', 'institution_name')
        .orderBy('count', 'desc')
    ]) as [any, any, any, any[], any[]];

    return {
      total: parseInt(totalResult?.count as string, 10) || 0,
      active: parseInt(activeResult?.count as string, 10) || 0,
      inactive: parseInt(inactiveResult?.count as string, 10) || 0,
      byType: byTypeResult.map(item => ({
        type: String(item.type || 'N/A'),
        count: parseInt(item.count as string, 10)
      })),
      byInstitution: byInstitutionResult.map(item => ({
        institution_id: parseInt(item.institution_id as string, 10),
        institution_name: String(item.institution_name || 'N/A'),
        count: parseInt(item.count as string, 10)
      }))
    };
  }

  /**
   * Verificar se existe uma unidade com o mesmo nome em uma instituição
   */
  async existsByNameAndInstitution(name: string, institutionId: number, excludeId?: string | number): Promise<boolean> {
    const query = this.db(this.tableName)
      .where('name', 'ilike', name)
      .andWhere('institution_id', institutionId);

    if (excludeId) {
      query.andWhere('id', '!=', excludeId);
    }

    const result = await query.first();
    return !!result;
  }

  /**
   * Buscar unidades recentemente criadas
   */
  async findRecentlyCreated(limit: number = 10): Promise<Unit[]> {
    return this.db(this.tableName)
      .where('deleted', false)
      .orderBy('date_created', 'desc')
      .limit(limit);
  }

  /**
   * Buscar unidades recentemente atualizadas
   */
  async findRecentlyUpdated(limit: number = 10): Promise<Unit[]> {
    return this.db(this.tableName)
      .where('deleted', false)
      .orderBy('last_updated', 'desc')
      .limit(limit);
  }
} 
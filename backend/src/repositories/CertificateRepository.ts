import { AppDataSource } from "../config/typeorm.config";
import { Repository } from "typeorm";
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Certificate } from '../entities/Certificate';
import { Knex } from 'knex';

export interface CertificateFilter {
  user_id?: number;
  tv_show_id?: number;
  tv_show_name?: string;
  document?: string;
  license_code?: string;
  recreate?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CertificateStats {
  totalCertificates: number;
  recreatable: number;
  programs: number;
  usersWithCerts: number;
}

export class CertificateRepository extends ExtendedRepository<Certificate> {
  private repository: Repository<Certificate>;
  constructor() {
    super("certificate");
    this.repository = AppDataSource.getRepository(Certificate);
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Certificate>> {
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
      console.error(`Erro ao buscar registros de certificate:`, error);
      throw error;
    }
  }

  /**
   * Busca certificados com condições customizadas
   */
  async findByCondition(whereClause: string, params: any[]): Promise<Certificate[]> {
    return this.db(this.tableName)
      .whereRaw(whereClause, params)
      .select('*');
  }

  /**
   * Busca paginada de certificados com filtros avançados
   */
  async findWithFilters(filters: CertificateFilter): Promise<{ items: Certificate[]; total: number; page: number; limit: number; totalPages: number }> {
    const {
      user_id,
      tv_show_id,
      tv_show_name,
      document,
      license_code,
      recreate,
      search,
      page = 1,
      limit = 10,
      sort_by = 'id',
      sort_order = 'desc'
    } = filters;

    // Construir a consulta base
    const buildQuery = () => {
      let query = this.db(this.tableName);

      // Aplicar filtros específicos
      if (user_id) {
        query = query.where('user_id', user_id);
      }

      if (tv_show_id) {
        query = query.where('tv_show_id', tv_show_id);
      }

      if (tv_show_name) {
        query = query.where('tv_show_name', tv_show_name);
      }

      if (document) {
        query = query.where('document', 'like', `%${document}%`);
      }

      if (license_code) {
        query = query.where('license_code', license_code);
      }

      if (recreate !== undefined) {
        query = query.where('recreate', recreate);
      }

      // Busca geral em vários campos
      if (search) {
        query = query.where(function(this: Knex.QueryBuilder) {
          this.where('document', 'like', `%${search}%`)
            .orWhere('license_code', 'like', `%${search}%`)
            .orWhere('tv_show_name', 'like', `%${search}%`);
        });
      }

      return query;
    };

    // Consulta para contar o total de registros
    const countQuery = buildQuery().count('id as count').first();
    
    // Consulta para buscar os dados
    const dataQuery = buildQuery();
    
    // Aplicar ordenação e paginação
    const validColumns = ['id', 'document', 'license_code', 'tv_show_name', 'score', 'date_created', 'last_updated'];
    const orderColumn = validColumns.includes(sort_by) ? sort_by : 'id';
    
    dataQuery
      .select('*')
      .orderBy(orderColumn, sort_order)
      .limit(limit)
      .offset((page - 1) * limit);

    // Executar as consultas
    const [totalResult, items] = await Promise.all([
      countQuery,
      dataQuery
    ]);

    const total = parseInt(totalResult?.count as string, 10) || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages
    };
  }

  /**
   * Obtém estatísticas dos certificados
   */
  async getStats(): Promise<CertificateStats> {
    // Total de certificados
    const totalResult = await this.db(this.tableName)
      .count('id as count')
      .first();
    const totalCertificates = parseInt(totalResult?.count as string, 10) || 0;

    // Certificados recriáveis
    const recreatableResult = await this.db(this.tableName)
      .where('recreate', true)
      .count('id as count')
      .first();
    const recreatable = parseInt(recreatableResult?.count as string, 10) || 0;

    // Total de programas distintos
    const programsResult = await this.db(this.tableName)
      .countDistinct('tv_show_name as count')
      .first();
    const programs = parseInt(programsResult?.count as string, 10) || 0;

    // Total de usuários com certificados
    const usersResult = await this.db(this.tableName)
      .countDistinct('user_id as count')
      .first();
    const usersWithCerts = parseInt(usersResult?.count as string, 10) || 0;

    return {
      totalCertificates,
      recreatable,
      programs,
      usersWithCerts
    };
  }
}
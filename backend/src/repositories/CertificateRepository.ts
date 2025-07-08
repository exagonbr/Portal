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
  constructor() {
    super('certificate');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Certificate>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('certificate');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('certificate.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('certificate.id', 'DESC')
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
          SELECT * FROM certificate
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM certificate
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
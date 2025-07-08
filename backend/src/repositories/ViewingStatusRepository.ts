import { AppDataSource } from '../config/typeorm.config';
import { Repository, DeleteResult } from 'typeorm';
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { ViewingStatus } from '../entities/ViewingStatus';

export class ViewingStatusRepository extends ExtendedRepository<ViewingStatus> {
  private repository: Repository<ViewingStatus>;

  constructor() {
    super('viewing_status');
    this.repository = AppDataSource.getRepository(ViewingStatus);
  }

  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<ViewingStatus>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('viewing_status');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('viewing_status.userId ILIKE :search', { search: `%${search}%` })
            .orWhere('viewing_status.videoId::text ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('viewing_status.id', 'DESC')
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
          SELECT * FROM viewing_status
          ${search ? `WHERE userId ILIKE '%${search}%' OR videoId::text ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM viewing_status
          ${search ? `WHERE userId ILIKE '%${search}%' OR videoId::text ILIKE '%${search}%'` : ''}
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
      console.error(`Erro ao buscar registros de viewing_status:`, error);
      throw error;
    }
  }

  async findById(id: number): Promise<ViewingStatus | null> {
    try {
      if (this.repository) {
        return await this.repository.findOneBy({ id });
      } else {
        const query = `SELECT * FROM viewing_status WHERE id = $1`;
        const result = await AppDataSource.query(query, [id]);
        return result[0] || null;
      }
    } catch (error) {
      console.error(`Erro ao buscar registro por ID em viewing_status:`, error);
      throw error;
    }
  }

  async create(data: Partial<ViewingStatus>): Promise<ViewingStatus> {
    try {
      if (this.repository) {
        const newEntity = this.repository.create(data);
        return await this.repository.save(newEntity);
      } else {
        // Implementação básica - você deve ajustar os campos conforme a estrutura da tabela
        const fields = Object.keys(data).filter(key => key !== 'id');
        const values = fields.map(field => data[field as keyof typeof data]);
        const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
        
        const query = `
          INSERT INTO viewing_status (${fields.join(', ')})
          VALUES (${placeholders})
          RETURNING *
        `;
        
        const result = await AppDataSource.query(query, values);
        return result[0];
      }
    } catch (error) {
      console.error(`Erro ao criar registro em viewing_status:`, error);
      throw error;
    }
  }

  async update(id: number, data: Partial<ViewingStatus>): Promise<ViewingStatus | null> {
    try {
      if (this.repository) {
        const entity = await this.repository.findOneBy({ id });
        if (!entity) return null;
        
        Object.assign(entity, data);
        return await this.repository.save(entity);
      } else {
        const fields = Object.keys(data).filter(key => key !== 'id');
        const values = fields.map(field => data[field as keyof typeof data]);
        const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
        
        const query = `
          UPDATE viewing_status
          SET ${setClause}, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
        `;
        
        const result = await AppDataSource.query(query, [id, ...values]);
        return result[0] || null;
      }
    } catch (error) {
      console.error(`Erro ao atualizar registro em viewing_status:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      if (this.repository) {
        const result: DeleteResult = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
      } else {
        const query = `DELETE FROM viewing_status WHERE id = $1`;
        const result = await AppDataSource.query(query, [id]);
        return result.rowCount > 0;
      }
    } catch (error) {
      console.error(`Erro ao deletar registro em viewing_status:`, error);
      throw error;
    }
  }
}

import { AppDataSource } from '../config/typeorm.config';
import { Repository, DeleteResult } from 'typeorm';
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { ActivitySessions } from '../entities/ActivitySessions';

export class ActivitySessionsRepository extends ExtendedRepository<ActivitySessions> {
  private repository: Repository<ActivitySessions>;

  constructor() {
    super('activity_sessions');
    this.repository = AppDataSource.getRepository(ActivitySessions);
  }

  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<ActivitySessions>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('activity_sessions');
        
        if (search) {
          queryBuilder = queryBuilder
            .where('activity_sessions.sessionId ILIKE :search', { search: `%${search}%` })
            .orWhere('activity_sessions.userId ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('activity_sessions.id', 'DESC')
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
          SELECT * FROM activity_sessions
          ${search ? `WHERE sessionId ILIKE '%${search}%' OR userId ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM activity_sessions
          ${search ? `WHERE sessionId ILIKE '%${search}%' OR userId ILIKE '%${search}%'` : ''}
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
      console.error(`Erro ao buscar registros de activity_sessions:`, error);
      throw error;
    }
  }

  // Implementação específica do findById
  async findById(id: number): Promise<ActivitySessions | null> {
    try {
      if (this.repository) {
        return await this.repository.findOneBy({ id });
      } else {
        const query = `SELECT * FROM activity_sessions WHERE id = $1`;
        const result = await AppDataSource.query(query, [id]);
        return result[0] || null;
      }
    } catch (error) {
      console.error(`Erro ao buscar registro por ID em activity_sessions:`, error);
      throw error;
    }
  }

  // Implementação específica do create
  async create(data: Partial<ActivitySessions>): Promise<ActivitySessions> {
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
          INSERT INTO activity_sessions (${fields.join(', ')})
          VALUES (${placeholders})
          RETURNING *
        `;
        
        const result = await AppDataSource.query(query, values);
        return result[0];
      }
    } catch (error) {
      console.error(`Erro ao criar registro em activity_sessions:`, error);
      throw error;
    }
  }

  // Implementação específica do update
  async update(id: number, data: Partial<ActivitySessions>): Promise<ActivitySessions | null> {
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
          UPDATE activity_sessions
          SET ${setClause}, updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *
        `;
        
        const result = await AppDataSource.query(query, [id, ...values]);
        return result[0] || null;
      }
    } catch (error) {
      console.error(`Erro ao atualizar registro em activity_sessions:`, error);
      throw error;
    }
  }

  // Implementação específica do delete
  async delete(id: number): Promise<boolean> {
    try {
      if (this.repository) {
        const result = await this.repository.delete(id);
        return result.affected ? result.affected > 0 : false;
      } else {
        const query = `DELETE FROM activity_sessions WHERE id = $1`;
        const result = await AppDataSource.query(query, [id]);
        return result.rowCount > 0;
      }
    } catch (error) {
      console.error(`Erro ao deletar registro em activity_sessions:`, error);
      throw error;
    }
  }
}

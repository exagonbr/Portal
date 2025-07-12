import { ExtendedRepository, PaginatedResult } from "./ExtendedRepository";
import { Repository } from "typeorm";
import { AppDataSource } from '../config/typeorm.config';
import { Repository, DeleteResult } from 'typeorm';

// Nota: Você precisa criar/importar a entidade correspondente
// import { Classes } from '../entities/Classes';

export class ClassesRepository extends Repository {
  private repository: Repository<any>;

  constructor() {
    super();
    // Descomente e ajuste quando a entidade estiver criada
    // this.repository = AppDataSource.getRepository(Classes);
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Classes>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('classes');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('classes.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('classes.id', 'DESC')
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
          SELECT * FROM classes
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM classes
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
      console.error(`Erro ao buscar registros de classes:`, error);
      throw error;
    }
  }

  async findAll(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<{ data: any[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      // Implementação temporária usando query raw
      const query = `
        SELECT * FROM classes
        ${search ? `WHERE name ILIKE '%${search}%' OR description ILIKE '%${search}%'` : ''}
        ORDER BY id DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;
      
      const countQuery = `
        SELECT COUNT(*) as total FROM classes
        ${search ? `WHERE name ILIKE '%${search}%' OR description ILIKE '%${search}%'` : ''}
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
    } catch (error) {
      console.error(`Erro ao buscar registros de classes:`, error);
      throw error;
    }
  }

  async findById(id: number): Promise<any | null> {
    try {
      const query = `SELECT * FROM classes WHERE id = $1`;
      const result = await AppDataSource.query(query, [id]);
      return result[0] || null;
    } catch (error) {
      console.error(`Erro ao buscar registro por ID em classes:`, error);
      throw error;
    }
  }

  async create(data: any): Promise<any> {
    try {
      // Implementação básica - você deve ajustar os campos conforme a estrutura da tabela
      const fields = Object.keys(data).filter(key => key !== 'id');
      const values = fields.map(field => data[field]);
      const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
      
      const query = `
        INSERT INTO classes (${fields.join(', ')})
        VALUES (${placeholders})
        RETURNING *
      `;
      
      const result = await AppDataSource.query(query, values);
      return result[0];
    } catch (error) {
      console.error(`Erro ao criar registro em classes:`, error);
      throw error;
    }
  }

  async update(id: number, data: any): Promise<any | null> {
    try {
      const fields = Object.keys(data).filter(key => key !== 'id');
      const values = fields.map(field => data[field]);
      const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(', ');
      
      const query = `
        UPDATE classes
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *
      `;
      
      const result = await AppDataSource.query(query, [id, ...values]);
      return result[0] || null;
    } catch (error) {
      console.error(`Erro ao atualizar registro em classes:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const query = `DELETE FROM classes WHERE id = $1`;
      const result = await AppDataSource.query(query, [id]);
      return result.rowCount > 0;
    } catch (error) {
      console.error(`Erro ao deletar registro em classes:`, error);
      throw error;
    }
  }
}

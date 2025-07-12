import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/typeorm.config';
import { Subject } from '../entities/Subject';

export interface CreateSubjectData {
  name: string;
  description: string;
  isActive?: boolean;
}

export interface UpdateSubjectData extends Partial<CreateSubjectData> {}

export class SubjectRepository extends ExtendedRepository<Subject> {
  private repository: Repository<Subject>;
  constructor() {
    super("subjects");
    this.repository = AppDataSource.getRepository(Subject);
  }
  
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Subject>> {
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
    } catch (error) {
      console.error(`Erro ao buscar registros de disciplinas:`, error);
      throw error;
    }
  }

  async toggleStatus(id: string): Promise<Subject | null> {
    try {
      const subject = await this.findById(id);
      if (!subject) return null;
      
      return this.update(id, { isActive: !subject.isActive });
    } catch (error) {
      console.error(`Erro ao alternar status da disciplina:`, error);
      throw error;
    }
  }

  async findByName(name: string): Promise<Subject[]> {
    try {
      return this.db(this.tableName)
        .where('name', 'ilike', `%${name}%`)
        .orderBy('name', 'asc');
    } catch (error) {
      console.error(`Erro ao buscar disciplinas por nome:`, error);
      throw error;
    }
  }

  async findActive(): Promise<Subject[]> {
    try {
      return this.db(this.tableName)
        .where('is_active', true)
        .orderBy('name', 'asc');
    } catch (error) {
      console.error(`Erro ao buscar disciplinas ativas:`, error);
      throw error;
    }
  }
}

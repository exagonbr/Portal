import { AppDataSource } from "../config/typeorm.config";
import { Repository } from "typeorm";
import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Course } from '../entities/Course';

export class CourseRepository extends ExtendedRepository<Course> {
  private repository: Repository<Course>;
  constructor() {
    super("courses");
    this.repository = AppDataSource.getRepository(Course);
  }
  
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Course>> {
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
      console.error(`Erro ao buscar registros de course:`, error);
      throw error;
    }
  }

  async toggleStatus(id: string | number): Promise<Course | null> {
    const course = await this.findById(id);
    if (!course) return null;
    return this.update(id, { is_active: !course.is_active } as Partial<Course>);
  }

  // Mock para os métodos de estudantes
  async getStudents(courseId: string): Promise<any[]> {
    console.log(`Getting students for course ${courseId}`);
    return [];
  }
  
  async addStudent(courseId: string, studentId: string): Promise<void> {
    console.log(`Adding student ${studentId} to course ${courseId}`);
  }
  
  async removeStudent(courseId: string, studentId: string): Promise<boolean> {
    console.log(`Removing student ${studentId} from course ${courseId}`);
    return true;
  }
}
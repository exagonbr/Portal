import { ExtendedRepository, PaginatedResult } from './ExtendedRepository';
import { Course } from '../entities/Course';

export class CourseRepository extends ExtendedRepository<Course> {
  constructor() {
    super('courses');
  }
  // Implementação do método abstrato findAllPaginated
  async findAllPaginated(options: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}): Promise<PaginatedResult<Course>> {
    const { page = 1, limit = 10, search } = options;
    
    try {
      if (this.repository) {
        let queryBuilder = this.repository.createQueryBuilder('course');
        
        // Adicione condições de pesquisa específicas para esta entidade
        if (search) {
          queryBuilder = queryBuilder
            .where('course.name ILIKE :search', { search: `%${search}%` });
        }
        
        const [data, total] = await queryBuilder
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('course.id', 'DESC')
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
          SELECT * FROM course
          ${search ? `WHERE name ILIKE '%${search}%'` : ''}
          ORDER BY id DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const countQuery = `
          SELECT COUNT(*) as total FROM course
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
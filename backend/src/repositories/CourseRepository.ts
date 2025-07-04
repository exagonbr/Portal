import { BaseRepository } from './BaseRepository';
import { Course } from '../entities/Course';
import { User } from '../entities/User';

export interface CreateCourseData extends Omit<Course, 'id' | 'created_at' | 'updated_at' | 'institution' | 'teacher' | 'students'> {}
export interface UpdateCourseData extends Partial<CreateCourseData> {}

export class CourseRepository extends BaseRepository<Course> {
  constructor() {
    super('courses');
  }

  async createCourse(data: CreateCourseData): Promise<Course> {
    return this.create(data);
  }

  async updateCourse(id: string, data: UpdateCourseData): Promise<Course | null> {
    return this.update(id, data);
  }

  async deleteCourse(id: string): Promise<boolean> {
    // Adicionar lógica para desvincular alunos/professores antes de deletar, se necessário.
    return this.delete(id);
  }

  async findByInstitution(institutionId: string): Promise<Course[]> {
    return this.findAll({ institution_id: parseInt(institutionId, 10) });
  }

  async findByLevel(level: string): Promise<Course[]> {
    return this.findAll({ level } as Partial<Course>);
  }

  async findByTeacher(teacherId: string): Promise<Course[]> {
    return this.findAll({ teacher_id: parseInt(teacherId, 10) });
  }

  async findByStudent(studentId: string): Promise<Course[]> {
    return this.db(this.tableName)
      .select('courses.*')
      .innerJoin('course_students', 'courses.id', 'course_students.course_id')
      .where('course_students.user_id', studentId);
  }

  async search(term: string, institutionId?: string): Promise<Course[]> {
    let query = this.db(this.tableName)
      .where('name', 'ilike', `%${term}%`)
      .orWhere('description', 'ilike', `%${term}%`);

    if (institutionId) {
      query = query.andWhere({ institution_id: parseInt(institutionId, 10) });
    }

    return query;
  }

  async addStudent(courseId: string, studentId: string): Promise<void> {
    await this.db('course_students').insert({
      course_id: courseId,
      user_id: studentId,
    });
  }

  async removeStudent(courseId: string, studentId: string): Promise<boolean> {
    const deletedRows = await this.db('course_students')
      .where({ course_id: courseId, user_id: studentId })
      .del();
    return deletedRows > 0;
  }

  async getStudents(courseId: string): Promise<User[]> {
    return this.db('user')
      .select('user.*')
      .innerJoin('course_students', 'user.id', 'course_students.user_id')
      .where('course_students.course_id', courseId);
  }
  
  async getCourseWithDetails(id: string): Promise<any | null> {
    const course = await this.db(this.tableName)
      .select(
        'courses.*',
        'institution.name as institution_name',
        'teacher.fullName as teacher_name'
      )
      .leftJoin('institution', 'courses.institution_id', 'institution.id')
      .leftJoin('user as teacher', 'courses.teacher_id', 'teacher.id')
      .where('courses.id', id)
      .first();

    if (!course) return null;

    const studentCount = await this.db('course_students')
        .where({ course_id: id })
        .count('* as count')
        .first();

    return {
        ...course,
        student_count: parseInt(studentCount?.count as string, 10) || 0
    };
  }
}
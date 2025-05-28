import { BaseRepository } from './BaseRepository';
import { Course, CreateCourseData, UpdateCourseData } from '../models/Course';

export class CourseRepository extends BaseRepository<Course> {
  constructor() {
    super('courses');
  }

  async findByInstitution(institutionId: string): Promise<Course[]> {
    return this.findAll({ institution_id: institutionId } as Partial<Course>);
  }

  async findByLevel(level: string): Promise<Course[]> {
    return this.findAll({ level } as Partial<Course>);
  }

  async createCourse(data: CreateCourseData): Promise<Course> {
    return this.create(data);
  }

  async updateCourse(id: string, data: UpdateCourseData): Promise<Course | null> {
    return this.update(id, data);
  }

  async deleteCourse(id: string): Promise<boolean> {
    return this.delete(id);
  }

  async searchCourses(searchTerm: string, institutionId?: string): Promise<Course[]> {
    let query = this.db(this.tableName)
      .where('name', 'ilike', `%${searchTerm}%`)
      .orWhere('description', 'ilike', `%${searchTerm}%`);

    if (institutionId) {
      query = query.andWhere('institution_id', institutionId);
    }

    return query.select('*');
  }

  async getCoursesWithInstitution(): Promise<any[]> {
    return this.db(this.tableName)
      .select(
        'courses.*',
        'institutions.name as institution_name'
      )
      .leftJoin('institutions', 'courses.institution_id', 'institutions.id');
  }

  async getCourseWithDetails(id: string): Promise<any | null> {
    const result = await this.db(this.tableName)
      .select(
        'courses.*',
        'institutions.name as institution_name'
      )
      .leftJoin('institutions', 'courses.institution_id', 'institutions.id')
      .where('courses.id', id)
      .first();

    return result || null;
  }

  async getCourseModules(courseId: string): Promise<any[]> {
    return this.db('modules')
      .where('course_id', courseId)
      .orderBy('order', 'asc')
      .select('*');
  }

  async getCourseBooks(courseId: string): Promise<any[]> {
    return this.db('books')
      .where('course_id', courseId)
      .select('*');
  }

  async getCourseVideos(courseId: string): Promise<any[]> {
    return this.db('videos')
      .where('course_id', courseId)
      .select('*');
  }

  async getCourseTeachers(courseId: string): Promise<any[]> {
    return this.db('course_teachers')
      .select(
        'users.id',
        'users.name',
        'users.email',
        'users.usuario'
      )
      .leftJoin('users', 'course_teachers.user_id', 'users.id')
      .where('course_teachers.course_id', courseId);
  }

  async getCourseStudents(courseId: string): Promise<any[]> {
    return this.db('course_students')
      .select(
        'users.id',
        'users.name',
        'users.email',
        'users.usuario',
        'course_students.progress',
        'course_students.grades'
      )
      .leftJoin('users', 'course_students.user_id', 'users.id')
      .where('course_students.course_id', courseId);
  }

  async addTeacherToCourse(courseId: string, userId: string): Promise<void> {
    await this.db('course_teachers').insert({
      course_id: courseId,
      user_id: userId,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  async removeTeacherFromCourse(courseId: string, userId: string): Promise<boolean> {
    const deletedRows = await this.db('course_teachers')
      .where({ course_id: courseId, user_id: userId })
      .del();
    return deletedRows > 0;
  }

  async addStudentToCourse(courseId: string, userId: string): Promise<void> {
    await this.db('course_students').insert({
      course_id: courseId,
      user_id: userId,
      progress: 0,
      created_at: new Date(),
      updated_at: new Date()
    });
  }

  async removeStudentFromCourse(courseId: string, userId: string): Promise<boolean> {
    const deletedRows = await this.db('course_students')
      .where({ course_id: courseId, user_id: userId })
      .del();
    return deletedRows > 0;
  }

  async updateStudentProgress(courseId: string, userId: string, progress: number, grades?: any): Promise<void> {
    await this.db('course_students')
      .where({ course_id: courseId, user_id: userId })
      .update({
        progress,
        grades,
        updated_at: new Date()
      });
  }
}

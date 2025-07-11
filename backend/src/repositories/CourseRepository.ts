import { BaseRepository } from './BaseRepository';
import { Course, CreateCourseData, UpdateCourseData } from '../models/Course';
import { Institution } from '../models/Institution';

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
        'institution.name as institution_name'
      )
      .leftJoin('institution', 'courses.institution_id', 'institution.id');
  }

  async getCourseWithDetails(id: string): Promise<any | null> {
    const result = await this.db(this.tableName)
      .select(
        'courses.*',
        'institution.name as institution_name'
      )
      .leftJoin('institution', 'courses.institution_id', 'institution.id')
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
        'User.id',
        'User.name',
        'User.email',
        'User.usuario'
      )
      .leftJoin('User', 'course_teachers.user_id', 'User.id')
      .where('course_teachers.course_id', courseId);
  }

  async getCourseStudents(courseId: string): Promise<any[]> {
    return this.db('course_students')
      .select(
        'User.id',
        'User.name',
        'User.email',
        'User.usuario',
        'course_students.progress',
        'course_students.grades'
      )
      .leftJoin('User', 'course_students.user_id', 'User.id')
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

  async getInstitutionForCourse(institutionId: string): Promise<Institution | undefined> {
    const institution = await this.db('institution')
      .where('id', institutionId)
      .first();
    return institution;
  }

  async countCourses(filters: any): Promise<number> {
    let query = this.db(this.tableName);

    if (filters.search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${filters.search}%`)
          .orWhere('description', 'ilike', `%${filters.search}%`);
      });
    }

    if (filters.institution_id) {
      query = query.where('institution_id', filters.institution_id);
    }

    if (filters.level) {
      query = query.where('level', filters.level);
    }

    if (filters.cycle) {
      query = query.where('cycle', filters.cycle);
    }

    if (filters.stage) {
      query = query.where('stage', filters.stage);
    }

    const result = await query.count('* as count').first();
    return Number(result?.count) || 0;
  }

  async findAllWithFilters(
    filters: any,
    pagination: { page: number; limit: number },
    sortBy?: keyof Course,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<Course[]> {
    let query = this.db(this.tableName);

    if (filters.search) {
      query = query.where(function() {
        this.where('name', 'ilike', `%${filters.search}%`)
          .orWhere('description', 'ilike', `%${filters.search}%`);
      });
    }

    if (filters.institution_id) {
      query = query.where('institution_id', filters.institution_id);
    }

    if (filters.level) {
      query = query.where('level', filters.level);
    }

    if (filters.cycle) {
      query = query.where('cycle', filters.cycle);
    }

    if (filters.stage) {
      query = query.where('stage', filters.stage);
    }

    if (sortBy) {
      query = query.orderBy(sortBy, sortOrder);
    }

    const offset = (pagination.page - 1) * pagination.limit;
    return query.limit(pagination.limit).offset(offset);
  }

  async getCoursesByTeacher(teacherId: string): Promise<any[]> {
    return this.db('courses')
      .select(
        'courses.*',
        'institution.name as institution_name'
      )
      .leftJoin('institution', 'courses.institution_id', 'institution.id')
      .leftJoin('course_teachers', 'courses.id', 'course_teachers.course_id')
      .where('course_teachers.user_id', teacherId);
  }

  async getCoursesByStudent(studentId: string): Promise<any[]> {
    return this.db('courses')
      .select(
        'courses.*',
        'institution.name as institution_name',
        'course_students.progress',
        'course_students.grades'
      )
      .leftJoin('institution', 'courses.institution_id', 'institution.id')
      .leftJoin('course_students', 'courses.id', 'course_students.course_id')
      .where('course_students.user_id', studentId);
  }
}

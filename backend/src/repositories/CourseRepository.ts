import { BaseRepository } from './BaseRepository';
import { Course } from '../entities/Course';

export class CourseRepository extends BaseRepository<Course> {
  constructor() {
    super('courses');
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
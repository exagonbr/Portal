import { BaseRepository } from './BaseRepository';

// Interface para desacoplar
export interface Course {
    id: string;
    name: string;
    description: string;
    institution_id: string;
    teacher_id?: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}

export class CourseRepository extends BaseRepository<Course> {
  constructor() {
    super('courses');
  }

  async toggleStatus(id: string): Promise<Course | null> {
    const course = await this.findById(id);
    if (!course) return null;
    return this.update(id, { active: !course.active } as Partial<Course>);
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
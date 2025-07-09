import { CrudService } from './crudService';

export interface Class {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  course_id: number;
  teacher_id: number;
  start_date: string;
  end_date: string;
  max_students: number;
  current_students: number;
  created_at: string;
  updated_at: string;
}

class ClassService extends CrudService<Class> {
  constructor() {
    super('/classes');
  }

  async enrollStudent(classId: number, studentId: number) {
    const response = await fetch(`${this.endpoint}/${classId}/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ student_id: studentId }),
    });
    return response.json();
  }

  async unenrollStudent(classId: number, studentId: number) {
    const response = await fetch(`${this.endpoint}/${classId}/unenroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ student_id: studentId }),
    });
    return response.json();
  }

  async getStudents(classId: number) {
    const response = await fetch(`${this.endpoint}/${classId}/students`);
    return response.json();
  }
}

export const classService = new ClassService();
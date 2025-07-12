import { CrudService } from './crudService';
import { apiGet, apiPost } from './apiService';

export interface Course {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
  category: string;
  duration: number;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

class CourseService extends CrudService<Course> {
  constructor() {
    super('/courses');
  }

  async getActiveWithUnits() {
    const response = await this.getAll({ status: 'active', include: 'units' });
    return response;
  }

  async uploadThumbnail(id: number, file: File) {
    const formData = new FormData();
    formData.append('thumbnail', file);
    
    const response = await fetch(`/api/courses/${id}/thumbnail`, {
      method: 'POST',
      body: formData,
    });
    
    return response.json();
  }
  
  async getCoursesByTeacher(teacherId: string) {
    return apiGet(`/courses/teacher/${teacherId}`);
  }
  
  async getCoursesByStudent(studentId: string) {
    return apiGet(`/courses/student/${studentId}`);
  }
}

export const courseService = new CourseService();

export const getCoursesByTeacher = async (teacherId: string) => {
  return await courseService.getCoursesByTeacher(teacherId);
};

export const getCoursesByStudent = async (studentId: string) => {
  return await courseService.getCoursesByStudent(studentId);
};
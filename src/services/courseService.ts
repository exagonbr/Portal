import { CrudService } from './crudService';

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
    
    const response = await fetch(`${this.endpoint}/${id}/thumbnail`, {
      method: 'POST',
      body: formData,
    });
    
    return response.json();
  }
}

export const courseService = new CourseService();
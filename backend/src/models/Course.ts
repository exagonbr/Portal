export interface Course {
  id: string;
  name: string;
  description?: string;
  institution_id: string;
  level?: string;
  duration?: number;
  teacher_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  institution_name?: string;
  student_count?: number;
}

export interface CreateCourseData {
  name: string;
  institution_id: string;
  description?: string;
  level?: string;
  duration?: number;
  teacher_id?: string;
  is_active?: boolean;
}

export interface UpdateCourseData {
  name?: string;
  description?: string;
  level?: string;
  duration?: number;
  teacher_id?: string;
  is_active?: boolean;
}
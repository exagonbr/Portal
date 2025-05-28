export interface Course {
  id: string;
  name: string;
  description?: string;
  level: 'BASIC' | 'PROFESSIONAL' | 'SUPERIOR';
  cycle: string;
  stage?: string;
  duration?: string;
  schedule?: any; // JSON field
  institution_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCourseData {
  name: string;
  description?: string;
  level: 'BASIC' | 'PROFESSIONAL' | 'SUPERIOR';
  cycle: string;
  stage?: string;
  duration?: string;
  schedule?: any;
  institution_id: string;
}

export interface UpdateCourseData {
  name?: string;
  description?: string;
  level?: 'BASIC' | 'PROFESSIONAL' | 'SUPERIOR';
  cycle?: string;
  stage?: string;
  duration?: string;
  schedule?: any;
  institution_id?: string;
}

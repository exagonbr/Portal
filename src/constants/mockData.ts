// Interfaces para tipos de dados do sistema

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  description?: string;
  publisher?: string;
  publication_year?: number;
  language?: string;
  pages?: number;
  category?: string;
  cover_url?: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  status: 'available' | 'unavailable';
  institution_id: string;
  institution_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  time_limit?: number;
  attempts_allowed?: number;
  passing_score?: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: QuestionType;
  options?: string[];
  correct_answer: string | string[];
  explanation?: string;
  points: number;
  order_index: number;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  created_at: string;
  updated_at: string;
}

export interface Course {
  id: string;
  title: string;
  code: string;
  description?: string;
  objectives?: string;
  duration_hours?: number;
  difficulty_level?: string;
  category?: string;
  thumbnail_url?: string;
  teacher_id: string;
  teacher_name?: string;
  institution_id: string;
  institution_name?: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  course_id: string;
  course_title?: string;
  objectives?: string;
  order_index: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: string;
  title: string;
  description?: string;
  module_id: string;
  type: 'video' | 'document' | 'assignment' | 'quiz' | 'link';
  content_url?: string;
  video_url?: string;
  duration?: number;
  thumbnail_url?: string;
  order_index: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Video extends Content {
  type: 'video';
  video_url: string;
  duration: number;
  thumbnail_url?: string;
}

// Dados vazios para compatibilidade (removidos gradualmente)
export const MOCK_USERS = {};
export const mockStudents: any[] = [];
export const mockTeachers: any[] = [];
export const mockCourses: Course[] = [];
export const mockBooks: Book[] = [];
export const mockVideos: Video[] = [];
export const mockHighlights: any[] = [];
export const mockAnnotations: any[] = [];
export const mockChats: any[] = [];
export const mockRoles: Role[] = [];
export const mockPermissions: Permission[] = [];
export const mockResources: any[] = [];
export const mockQuiz: Partial<Quiz> = {};
export const teacherMockData: any = {};
export const studentMockData: any = {};
export const mockModuleCollection: Module[] = [];
export const mockContentVideos: Content[] = [];
export const mockContentCollections: Content[] = [];
export const carouselVideoImages: string[] = [];
export const carouselBookImages: string[] = []; 
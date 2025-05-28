export interface Lesson {
  id: string;
  title: string;
  content: string;
  order: number;
  type: 'video' | 'reading' | 'quiz' | 'assignment';
  duration?: string;
  xp_reward: number;
  is_completed: boolean;
  video_url?: string;
  requirements?: any; // JSON field
  module_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateLessonData {
  title: string;
  content: string;
  order: number;
  type: 'video' | 'reading' | 'quiz' | 'assignment';
  duration?: string;
  xp_reward?: number;
  is_completed?: boolean;
  video_url?: string;
  requirements?: any;
  module_id: string;
}

export interface UpdateLessonData {
  title?: string;
  content?: string;
  order?: number;
  type?: 'video' | 'reading' | 'quiz' | 'assignment';
  duration?: string;
  xp_reward?: number;
  is_completed?: boolean;
  video_url?: string;
  requirements?: any;
  module_id?: string;
}

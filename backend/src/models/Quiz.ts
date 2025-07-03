export interface Quiz {
  id: string;
  title: string;
  description?: string;
  time_limit?: number;
  passing_score: number;
  attempts: number;
  is_graded: boolean;
  course_id?: string;
  module_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateQuizData {
  title: string;
  description?: string;
  time_limit?: number;
  passing_score: number;
  attempts?: number;
  is_graded?: boolean;
  course_id?: string;
  module_id?: string;
}

export interface UpdateQuizData {
  title?: string;
  description?: string;
  time_limit?: number;
  passing_score?: number;
  attempts?: number;
  is_graded?: boolean;
  course_id?: string;
  module_id?: string;
}

export interface Question {
  id: string;
  quiz_id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  text: string;
  options?: string[];
  correct_answer: string[];
  points: number;
  explanation?: string;
  order: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateQuestionData {
  quiz_id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  text: string;
  options?: string[];
  correct_answer: string[];
  points: number;
  explanation?: string;
  order: number;
}

export interface UpdateQuestionData {
  quiz_id?: string;
  type?: 'multiple-choice' | 'true-false' | 'short-answer';
  text?: string;
  options?: string[];
  correct_answer?: string[];
  points?: number;
  explanation?: string;
  order?: number;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  attempt_number: number;
  score?: number;
  passed: boolean;
  answers?: any; // JSON field
  started_at?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

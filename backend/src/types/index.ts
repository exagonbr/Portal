// Tipos básicos do sistema
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'manager' | 'teacher' | 'student';
  institution: string;
  courses: string[];
  endereco: string;
  telefone: string;
  usuario: string;
  unidadeEnsino: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
  lastLogin?: Date;
}

export interface Institution {
  id: string;
  name: string;
  type: 'UNIVERSITY' | 'COLLEGE' | 'TECH_CENTER' | 'SCHOOL';
  characteristics: string[];
  address?: string;
  phone?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Course {
  id: string;
  name: string;
  description: string;
  level: 'BASIC' | 'SUPERIOR' | 'PROFESSIONAL';
  cycle: string;
  stage: string;
  institution: Institution;
  duration: string;
  schedule: {
    startDate: string;
    endDate: string;
    classDays: string[];
    classTime: string;
  };
  teachers: string[];
  students: string[];
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export interface Book {
  id: string;
  thumbnail: string;
  title: string;
  author: string;
  publisher: string;
  synopsis: string;
  duration: string;
  progress?: number;
  format?: 'pdf' | 'epub';
  filePath?: string;
  pageCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export interface Video {
  id: string;
  thumbnail: string;
  title: string;
  duration: string;
  progress?: number;
  videoUrl?: string;
  description?: string;
  courseId?: string;
  moduleId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  courses: string[];
  department: string;
  availability: {
    days: string[];
    hours: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  progress: number;
  grades: {
    assignments: number;
    tests: number;
    participation: number;
  };
  enrolledCourses: string[];
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

// Tipos para Quiz e Questões
export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
  quizId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit?: number;
  passingScore: number;
  attempts: number;
  isGraded: boolean;
  courseId?: string;
  moduleId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

// Tipos para Módulos e Lições
export interface Module {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  isCompleted: boolean;
  prerequisites?: string[];
  courseId: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment';
  duration: string;
  xpReward: number;
  isCompleted: boolean;
  content?: string;
  videoUrl?: string;
  moduleId: string;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export interface LessonRequirement {
  id: string;
  type: 'lesson' | 'quiz' | 'assignment';
  lessonId: string;
  requiredLessonId: string;
  description: string;
  createdAt?: Date;
}

// Tipos para Anotações e Destaques
export interface Annotation {
  id: string;
  pageNumber: number;
  content: string;
  position: { x: number; y: number };
  bookId: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Highlight {
  id: string;
  pageNumber: number;
  content: string;
  color: string;
  position: { x: number; y: number; width: number; height: number };
  bookId: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

// Tipos para Comunicação
export interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  readBy: string[];
  chatRoomId: string;
  messageType?: 'text' | 'image' | 'file';
  attachmentUrl?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  courseId?: string;
  isGroup: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ForumTagCategory {
  Question = 'question',
  Discussion = 'discussion',
  Announcement = 'announcement',
  Resource = 'resource',
  Assignment = 'assignment',
  Technical = 'technical',
  General = 'general'
}

export interface ForumThread {
  id: string;
  classId: string;
  title: string;
  content: string;
  authorId: string;
  tags: ForumTagCategory[];
  createdAt: string;
  updatedAt: string;
  replies: ForumReply[];
  pinned: boolean;
  locked: boolean;
  views: number;
}

export interface ForumReply {
  id: string;
  threadId: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  parentReplyId?: string;
}

// Tipos para Progresso e Estatísticas
export interface UserProgress {
  id: string;
  userId: string;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  bookId?: string;
  videoId?: string;
  progress: number;
  completedAt?: Date;
  lastAccessedAt: Date;
  timeSpent?: number;
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  assignmentId?: string;
  quizId?: string;
  grade: number;
  maxGrade: number;
  weight: number;
  gradedBy: string;
  gradedAt: Date;
  feedback?: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  courseId: string;
  classDate: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  markedBy: string;
  markedAt: Date;
  notes?: string;
}

// Tipos para Notificações
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'course' | 'assignment' | 'grade' | 'system' | 'chat';
  isRead: boolean;
  actionUrl?: string;
  createdAt: Date;
  readAt?: Date;
}

// Tipos para Uploads e Arquivos
export interface FileUpload {
  id: string;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  path: string;
  uploadedBy: string;
  uploadedAt: Date;
  category: 'book' | 'video' | 'image' | 'document' | 'other';
  isProcessed: boolean;
  metadata?: Record<string, any>;
}

// Tipos para API Responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Tipos para Autenticação
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'teacher' | 'student';
  institution: string;
  endereco: string;
  telefone: string;
  usuario: string;
  unidadeEnsino: string;
}

// Tipos para Dashboard
export interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  totalBooks: number;
  totalVideos: number;
  activeUsers: number;
  completionRate: number;
}

export interface TeacherDashboard {
  totalStudents: number;
  activeClasses: number;
  averageAttendance: number;
  upcomingClasses: Array<{
    id: number;
    subject: string;
    time: string;
    date: string;
    students: number;
    room: string;
  }>;
  recentActivities: Array<{
    id: number;
    type: string;
    subject: string;
    class: string;
    date: string;
    status: string;
    averageGrade?: number;
    submissions: number;
    totalStudents: number;
  }>;
}

export interface StudentDashboard {
  currentGrade: number;
  attendanceRate: number;
  completedAssignments: number;
  totalAssignments: number;
  ranking: {
    position: number;
    totalStudents: number;
    improvement: number;
  };
  upcomingDeadlines: Array<{
    id: number;
    subject: string;
    task: string;
    deadline: string;
    type: string;
    weight: number;
    status: string;
  }>;
}
export type ShiftType = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'FULL_TIME';

export interface Class {
  id: string;
  name: string;
  code: string;
  school_id: string;
  year: number;
  shift: ShiftType;
  max_students: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateClassData {
  name: string;
  code: string;
  school_id: string;
  year: number;
  shift: ShiftType;
  max_students?: number;
  is_active?: boolean;
}

export interface UpdateClassData {
  name?: string;
  code?: string;
  school_id?: string;
  year?: number;
  shift?: ShiftType;
  max_students?: number;
  is_active?: boolean;
}

export interface ClassStats {
  totalStudents: number;
  totalTeachers: number;
  averageStudents: number;
  occupancyRate: number;
}

export interface ClassWithDetails extends Class {
  school_name: string;
  student_count: number;
  teacher_count: number;
  education_cycles: Array<{
    id: string;
    name: string;
    level: string;
  }>;
}

export interface ClassFilter {
  search?: string;
  school_id?: string;
  year?: number;
  shift?: ShiftType;
  is_active?: boolean;
  page?: number;
  limit?: number;
  sortBy?: keyof Class;
  sortOrder?: 'asc' | 'desc';
}

export const SHIFT_LABELS: Record<ShiftType, string> = {
  MORNING: 'Manhã',
  AFTERNOON: 'Tarde',
  EVENING: 'Noite',
  FULL_TIME: 'Integral'
};
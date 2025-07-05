export enum ShiftType {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  EVENING = 'EVENING',
  FULL_TIME = 'FULL_TIME'
}

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
  school_name?: string;
  student_count?: number;
  teacher_count?: number;
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
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
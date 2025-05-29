export type EducationLevel = 
  | 'EDUCACAO_INFANTIL'
  | 'ENSINO_FUNDAMENTAL_I'
  | 'ENSINO_FUNDAMENTAL_II'
  | 'ENSINO_MEDIO'
  | 'ENSINO_TECNICO'
  | 'ENSINO_SUPERIOR';

export interface EducationCycle {
  id: string;
  name: string;
  level: EducationLevel;
  description?: string;
  duration_years: number;
  min_age?: number;
  max_age?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateEducationCycleData {
  name: string;
  level: EducationLevel;
  description?: string;
  duration_years: number;
  min_age?: number;
  max_age?: number;
}

export interface UpdateEducationCycleData {
  name?: string;
  level?: EducationLevel;
  description?: string;
  duration_years?: number;
  min_age?: number;
  max_age?: number;
}

export interface ClassEducationCycle {
  id: string;
  class_id: string;
  education_cycle_id: string;
  created_at: Date;
  updated_at: Date;
}
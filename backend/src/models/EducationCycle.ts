export enum EducationLevel {
  EDUCACAO_INFANTIL = 'EDUCACAO_INFANTIL',
  ENSINO_FUNDAMENTAL_I = 'ENSINO_FUNDAMENTAL_I',
  ENSINO_FUNDAMENTAL_II = 'ENSINO_FUNDAMENTAL_II',
  ENSINO_MEDIO = 'ENSINO_MEDIO',
  ENSINO_TECNICO = 'ENSINO_TECNICO',
  ENSINO_SUPERIOR = 'ENSINO_SUPERIOR'
}

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
  total_students?: number;
  total_teachers?: number;
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
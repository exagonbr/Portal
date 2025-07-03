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

export interface EducationCycleWithClasses extends EducationCycle {
  classes: Array<{
    id: string;
    name: string;
    code: string;
    school_name: string;
    year: number;
  }>;
  total_students: number;
  total_teachers: number;
}

export interface EducationCycleFilter {
  search?: string;
  level?: EducationLevel;
  page?: number;
  limit?: number;
  sortBy?: keyof EducationCycle;
  sortOrder?: 'asc' | 'desc';
}

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  EDUCACAO_INFANTIL: 'Educação Infantil',
  ENSINO_FUNDAMENTAL_I: 'Ensino Fundamental I (1º ao 5º ano)',
  ENSINO_FUNDAMENTAL_II: 'Ensino Fundamental II (6º ao 9º ano)',
  ENSINO_MEDIO: 'Ensino Médio',
  ENSINO_TECNICO: 'Ensino Técnico',
  ENSINO_SUPERIOR: 'Ensino Superior'
};

export const EDUCATION_LEVEL_COLORS: Record<EducationLevel, string> = {
  EDUCACAO_INFANTIL: '#FFB6C1',
  ENSINO_FUNDAMENTAL_I: '#87CEEB',
  ENSINO_FUNDAMENTAL_II: '#4682B4',
  ENSINO_MEDIO: '#32CD32',
  ENSINO_TECNICO: '#FF8C00',
  ENSINO_SUPERIOR: '#9370DB'
};
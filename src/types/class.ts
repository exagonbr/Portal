import { BaseEntityDto, BaseFilter, UUID } from './common';

export enum ShiftType {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  EVENING = 'EVENING',
  FULL_TIME = 'FULL_TIME'
}

// Labels para os turnos em português
export const SHIFT_LABELS: Record<ShiftType, string> = {
  [ShiftType.MORNING]: 'Manhã',
  [ShiftType.AFTERNOON]: 'Tarde', 
  [ShiftType.EVENING]: 'Noite',
  [ShiftType.FULL_TIME]: 'Integral'
};

// DTO para a entidade Class, usado no frontend
export interface ClassDto extends BaseEntityDto {
  name: string;
  code: string;
  school_id: UUID;
  school_name?: string;
  year: number;
  shift: ShiftType;
  max_students: number;
  is_active: boolean;
  students_count?: number;
  teacher_name?: string;
}

// DTO para criação de Class
export interface CreateClassDto {
  name: string;
  code: string;
  school_id: UUID;
  year: number;
  shift: ShiftType;
  max_students: number;
  is_active?: boolean;
}

// DTO para atualização de Class
export interface UpdateClassDto {
  name?: string;
  code?: string;
  school_id?: UUID;
  year?: number;
  shift?: ShiftType;
  max_students?: number;
  is_active?: boolean;
}

// Interface para filtros de Class
export interface ClassFilter extends BaseFilter {
  school_id?: UUID;
  year?: number;
  shift?: ShiftType;
  is_active?: boolean;
}

// Tipos legados para compatibilidade
export type Class = ClassDto;
export type CreateClassData = CreateClassDto;
export type UpdateClassData = UpdateClassDto;
import { BaseEntityDto, BaseFilter, UUID } from './common';

export enum UserClassRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  COORDINATOR = 'COORDINATOR'
}

// DTO para a entidade UserClass, usado no frontend
export interface UserClassDto extends BaseEntityDto {
  user_id: UUID;
  user_name?: string;
  class_id: UUID;
  class_name?: string;
  role: UserClassRole;
  enrollment_date: string;
  exit_date?: string;
  is_active: boolean;
}

// DTO para criação de UserClass
export interface CreateUserClassDto {
  user_id: UUID;
  class_id: UUID;
  role: UserClassRole;
  enrollment_date: string;
  exit_date?: string;
  is_active?: boolean;
}

// DTO para atualização de UserClass
export interface UpdateUserClassDto {
  user_id?: UUID;
  class_id?: UUID;
  role?: UserClassRole;
  enrollment_date?: string;
  exit_date?: string;
  is_active?: boolean;
}

// Interface para filtros de UserClass
export interface UserClassFilter extends BaseFilter {
  user_id?: UUID;
  class_id?: UUID;
  role?: UserClassRole;
  is_active?: boolean;
}
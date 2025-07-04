import { BaseEntityDto, BaseFilter, UUID } from './common';

export enum ManagerPosition {
  PRINCIPAL = 'PRINCIPAL',
  VICE_PRINCIPAL = 'VICE_PRINCIPAL',
  COORDINATOR = 'COORDINATOR',
  SUPERVISOR = 'SUPERVISOR'
}

// DTO para a entidade SchoolManager, usado no frontend
export interface SchoolManagerDto extends BaseEntityDto {
  user_id: UUID;
  user_name?: string;
  school_id: UUID;
  school_name?: string;
  position: ManagerPosition;
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

// DTO para criação de SchoolManager
export interface CreateSchoolManagerDto {
  user_id: UUID;
  school_id: UUID;
  position: ManagerPosition;
  start_date: string;
  end_date?: string;
  is_active?: boolean;
}

// DTO para atualização de SchoolManager
export interface UpdateSchoolManagerDto {
  user_id?: UUID;
  school_id?: UUID;
  position?: ManagerPosition;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
}

// Interface para filtros de SchoolManager
export interface SchoolManagerFilter extends BaseFilter {
  user_id?: UUID;
  school_id?: UUID;
  position?: ManagerPosition;
  is_active?: boolean;
}
import { BaseEntityDto, BaseFilter, UUID } from './common';

// DTO para a entidade Unit, usado no frontend
export interface UnitDto extends BaseEntityDto {
  name: string;
  institution_id: UUID;
  institution_name?: string;
  deleted?: boolean;
}

// DTO para criação de Unit
export interface CreateUnitDto {
  name: string;
  institution_id: UUID;
  institution_name?: string;
  deleted?: boolean;
}

// DTO para atualização de Unit
export interface UpdateUnitDto {
  name?: string;
  institution_id?: UUID;
  institution_name?: string;
  deleted?: boolean;
}

// Interface para filtros de Unit
export interface UnitFilter extends BaseFilter {
  institution_id?: UUID;
  deleted?: boolean;
}
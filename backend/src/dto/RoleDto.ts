import { BaseEntity } from '../types/common';

export interface CreateRoleDto {
  authority?: string;
  display_name?: string;
}

export interface UpdateRoleDto {
  authority?: string;
  display_name?: string;
}

export interface RoleResponseDto extends BaseEntity {
  id: string;
  version?: number;
  authority?: string;
  display_name?: string;
}
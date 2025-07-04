import { BaseEntity } from '../types/common';

export interface CreateTeacherSubjectDto {
  is_child?: boolean;
  is_deleted?: boolean;
  name?: string;
  uuid?: string;
}

export interface UpdateTeacherSubjectDto {
  is_child?: boolean;
  is_deleted?: boolean;
  name?: string;
  uuid?: string;
}

export interface TeacherSubjectResponseDto extends BaseEntity {
  id: string;
  version?: number;
  is_child?: boolean;
  is_deleted?: boolean;
  name?: string;
  uuid?: string;
}
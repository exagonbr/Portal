import { BaseEntity } from '../types/common';

export interface CreateProfileDto {
  avatar_color?: string;
  is_child?: boolean;
  is_deleted?: boolean;
  profile_language?: string;
  profile_name?: string;
  user_id?: string | null;
}

export interface UpdateProfileDto {
  avatar_color?: string;
  is_child?: boolean;
  is_deleted?: boolean;
  profile_language?: string;
  profile_name?: string;
  user_id?: string | null;
}

export interface ProfileResponseDto extends BaseEntity {
  id: string;
  version?: number;
  avatar_color?: string;
  is_child?: boolean;
  is_deleted?: boolean;
  profile_language?: string;
  profile_name?: string;
  user_id?: string | null;
}
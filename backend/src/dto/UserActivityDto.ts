import { BaseEntity } from '../types/common';

export interface CreateUserActivityDto {
  date_created: Date;
  populated: boolean;
  browser?: string;
  device?: string;
  ip_address?: string;
  last_updated?: Date;
  operating_system?: string;
  type?: string;
  user_id?: string | null;
  video_id?: string | null;
  institution_id?: string | null;
  unit_id?: string | null;
  fullname?: string;
  institution_name?: string;
  is_certified?: boolean;
  username?: string;
  units_data?: string;
  user_data?: string;
  role?: string;
}

export interface UpdateUserActivityDto {
  last_updated?: Date;
  populated?: boolean;
  browser?: string;
  device?: string;
  ip_address?: string;
  operating_system?: string;
  type?: string;
  user_id?: string | null;
  video_id?: string | null;
  institution_id?: string | null;
  unit_id?: string | null;
  fullname?: string;
  institution_name?: string;
  is_certified?: boolean;
  username?: string;
  units_data?: string;
  user_data?: string;
  role?: string;
}

export interface UserActivityResponseDto extends BaseEntity {
  id: string;
  version?: number;
  browser?: string;
  date_created: string;
  device?: string;
  ip_address?: string;
  last_updated?: string;
  operating_system?: string;
  type?: string;
  user_id?: string | null;
  video_id?: string | null;
  institution_id?: string | null;
  unit_id?: string | null;
  fullname?: string;
  institution_name?: string;
  is_certified?: boolean;
  username?: string;
  units_data?: string;
  user_data?: string;
  populated: boolean;
  role?: string;
}
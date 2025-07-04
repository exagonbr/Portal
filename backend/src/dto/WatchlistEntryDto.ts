import { BaseEntity } from '../types/common';

export interface CreateWatchlistEntryDto {
  is_deleted: boolean;
  profile_id: string;
  user_id: string;
  date_created?: Date;
  last_updated?: Date;
  tv_show_id?: string | null;
  video_id?: string | null;
}

export interface UpdateWatchlistEntryDto {
  is_deleted?: boolean;
  profile_id?: string;
  user_id?: string;
  last_updated?: Date;
  tv_show_id?: string | null;
  video_id?: string | null;
}

export interface WatchlistEntryResponseDto extends BaseEntity {
  id: string;
  version?: number;
  date_created?: string;
  is_deleted: boolean;
  last_updated?: string;
  profile_id: string;
  tv_show_id?: string | null;
  user_id: string;
  video_id?: string | null;
}
import { BaseEntity } from '../types/common';

export interface CreateViewingStatusDto {
  current_play_time: number;
  video_id: string;
  completed?: boolean;
  date_created?: Date;
  last_updated?: Date;
  profile_id?: string | null;
  runtime?: number;
  tv_show_id?: string | null;
  user_id?: string | null;
}

export interface UpdateViewingStatusDto {
  current_play_time?: number;
  video_id?: string;
  completed?: boolean;
  last_updated?: Date;
  profile_id?: string | null;
  runtime?: number;
  tv_show_id?: string | null;
  user_id?: string | null;
}

export interface ViewingStatusResponseDto extends BaseEntity {
  id: string;
  version?: number;
  completed?: boolean;
  current_play_time: number;
  date_created?: string;
  last_updated?: string;
  profile_id?: string | null;
  runtime?: number;
  tv_show_id?: string | null;
  user_id?: string | null;
  video_id: string;
}
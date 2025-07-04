import { BaseEntity } from '../types/common';

export interface CreateNotificationQueueDto {
  date_created: Date;
  last_updated: Date;
  description?: string;
  is_completed?: boolean;
  movie_id?: string | null;
  tv_show_id?: string | null;
  type?: string;
  video_to_play_id?: string | null;
}

export interface UpdateNotificationQueueDto {
  last_updated: Date;
  description?: string;
  is_completed?: boolean;
  movie_id?: string | null;
  tv_show_id?: string | null;
  type?: string;
  video_to_play_id?: string | null;
}

export interface NotificationQueueResponseDto extends BaseEntity {
  id: string;
  version?: number;
  date_created: string;
  description?: string;
  is_completed?: boolean;
  last_updated: string;
  movie_id?: string | null;
  tv_show_id?: string | null;
  type?: string;
  video_to_play_id?: string | null;
}
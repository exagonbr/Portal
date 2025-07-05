import { BaseEntity } from '../types/common';

export interface CreateReportDto {
  date_created: Date;
  last_updated: Date;
  created_by_id?: string | null;
  error_code?: string;
  resolved?: boolean;
  video_id?: string | null;
}

export interface UpdateReportDto {
  last_updated: Date;
  created_by_id?: string | null;
  error_code?: string;
  resolved?: boolean;
  video_id?: string | null;
}

export interface ReportResponseDto extends BaseEntity {
  id: string;
  version?: number;
  created_by_id?: string | null;
  date_created: string;
  error_code?: string;
  last_updated: string;
  resolved?: boolean;
  video_id?: string | null;
}
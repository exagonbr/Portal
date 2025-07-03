export interface Video {
  id: string;
  title: string;
  description?: string;
  file_path: string;
  thumbnail_path?: string;
  duration: string;
  progress: number;
  course_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateVideoData {
  title: string;
  description?: string;
  file_path: string;
  thumbnail_path?: string;
  duration: string;
  progress?: number;
  course_id: string;
}

export interface UpdateVideoData {
  title?: string;
  description?: string;
  file_path?: string;
  thumbnail_path?: string;
  duration?: string;
  progress?: number;
  course_id?: string;
}

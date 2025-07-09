export interface VideoFileDto {
  id: number;
  videoFilesId: number;
  fileId?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVideoFileDto {
  videoFilesId: number;
  fileId?: number;
}

export interface UpdateVideoFileDto {
  videoFilesId?: number;
  fileId?: number;
}

export interface VideoFileFilterDto {
  page?: number;
  limit?: number;
  search?: string;
  videoFilesId?: number;
  fileId?: number;
}

export interface VideoFileResponseDto {
  success: boolean;
  data?: VideoFileDto | VideoFileDto[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
} 
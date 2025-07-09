export interface FilesDto {
  id: number;
  version?: number;
  contentType?: string;
  dateCreated: Date;
  extension?: string;
  externalLink?: string;
  isDefault?: boolean;
  isPublic?: boolean;
  label?: string;
  lastUpdated: Date;
  localFile?: string;
  name?: string;
  originalFilename?: string;
  quality?: string;
  sha256hex?: string;
  size?: number;
  subtitleLabel?: string;
  subtitleSrcLang?: string;
  isSubtitled?: boolean;
}

export interface CreateFilesDto {
  version?: number;
  contentType?: string;
  extension?: string;
  externalLink?: string;
  isDefault?: boolean;
  isPublic?: boolean;
  label?: string;
  localFile?: string;
  name?: string;
  originalFilename?: string;
  quality?: string;
  sha256hex?: string;
  size?: number;
  subtitleLabel?: string;
  subtitleSrcLang?: string;
  isSubtitled?: boolean;
}

export interface UpdateFilesDto {
  version?: number;
  contentType?: string;
  extension?: string;
  externalLink?: string;
  isDefault?: boolean;
  isPublic?: boolean;
  label?: string;
  localFile?: string;
  name?: string;
  originalFilename?: string;
  quality?: string;
  sha256hex?: string;
  size?: number;
  subtitleLabel?: string;
  subtitleSrcLang?: string;
  isSubtitled?: boolean;
}

export interface FilesFilterDto {
  page?: number;
  limit?: number;
  search?: string;
  contentType?: string;
  extension?: string;
  isDefault?: boolean;
  isPublic?: boolean;
  quality?: string;
  isSubtitled?: boolean;
}

export interface FilesResponseDto {
  success: boolean;
  data?: FilesDto | FilesDto[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
} 
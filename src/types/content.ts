export enum ContentType {
  PDF = 'PDF',
  MP4 = 'MP4',
  YOUTUBE = 'YOUTUBE',
  SCORM = 'SCORM',
  EPUB = 'EPUB'
}

export interface ContentMetadata {
  id: string;
  title: string;
  description: string;
  type: ContentType;
  uploadedBy: string;
  uploadedAt: Date;
  size: number; // in bytes
  duration?: number; // for videos, in seconds
  thumbnail: string;
  tags: string[];
  url: string;
  s3Key?: string;
}

export interface ContentUploadResponse {
  metadata: ContentMetadata;
  uploadUrl: string; // Presigned S3 URL for direct upload
}

export interface ContentSearchResult {
  content: ContentMetadata;
  relevanceScore: number;
  matchedTags: string[];
}

export interface ContentSearchParams {
  query: string;
  type?: ContentType;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface EmbedConfig {
  type: ContentType;
  url: string;
  title: string;
  width?: string;
  height?: string;
  autoplay?: boolean;
  controls?: boolean;
}

export interface ThumbnailGenerationResult {
  thumbnailUrl: string;
  extractedTags: string[];
}

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
  size: number; // em bytes
  duration?: number; // para vídeos, em segundos
  thumbnail: string;
  tags: string[];
  url: string;
  s3Key?: string;
}

export interface ContentUploadResponse {
  metadata: ContentMetadata;
  uploadUrl: string; // URL pré-assinada do S3 para upload direto
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

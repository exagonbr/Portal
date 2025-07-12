export interface VideoResponseDto {
  id: number;
  title: string;
  description?: string;
  filePath?: string;
  thumbnailUrl?: string;
  duration?: number;
  tvShowId?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  createdAt: string;
  updatedAt: string;
  // Campos adicionais necessários
  url?: string;
  type?: string;
  genre?: string;
  releaseDate?: string;
}
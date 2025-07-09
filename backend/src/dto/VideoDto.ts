import { BaseEntity } from '../types/common';

export interface VideoDto {
  id: number;
  version?: number;
  apiId?: string;
  dateCreated: Date;
  deleted?: boolean;
  imdbId?: string;
  introEnd?: number;
  introStart?: number;
  lastUpdated: Date;
  originalLanguage?: string;
  outroStart?: number;
  overview?: string;
  popularity?: number;
  reportCount?: number;
  voteAverage?: number;
  voteCount?: number;
  class: string;
  backdropPath?: string;
  posterImageId?: number;
  posterPath?: string;
  releaseDate?: string;
  title?: string;
  trailerKey?: string;
  backdropImageId?: number;
  airDate?: string;
  episodeString?: string;
  episodeNumber?: number;
  name?: string;
  seasonEpisodeMerged?: number;
  seasonNumber?: number;
  showId?: number;
  stillImageId?: number;
  stillPath?: string;
  duration?: string;
}

export interface CreateVideoDto {
  version?: number;
  apiId?: string;
  deleted?: boolean;
  imdbId?: string;
  introEnd?: number;
  introStart?: number;
  originalLanguage?: string;
  outroStart?: number;
  overview?: string;
  popularity?: number;
  reportCount?: number;
  voteAverage?: number;
  voteCount?: number;
  class: string;
  backdropPath?: string;
  posterImageId?: number;
  posterPath?: string;
  releaseDate?: string;
  title?: string;
  trailerKey?: string;
  backdropImageId?: number;
  airDate?: string;
  episodeString?: string;
  episodeNumber?: number;
  name?: string;
  seasonEpisodeMerged?: number;
  seasonNumber?: number;
  showId?: number;
  stillImageId?: number;
  stillPath?: string;
  duration?: string;
}

export interface UpdateVideoDto {
  version?: number;
  apiId?: string;
  deleted?: boolean;
  imdbId?: string;
  introEnd?: number;
  introStart?: number;
  originalLanguage?: string;
  outroStart?: number;
  overview?: string;
  popularity?: number;
  reportCount?: number;
  voteAverage?: number;
  voteCount?: number;
  class?: string;
  backdropPath?: string;
  posterImageId?: number;
  posterPath?: string;
  releaseDate?: string;
  title?: string;
  trailerKey?: string;
  backdropImageId?: number;
  airDate?: string;
  episodeString?: string;
  episodeNumber?: number;
  name?: string;
  seasonEpisodeMerged?: number;
  seasonNumber?: number;
  showId?: number;
  stillImageId?: number;
  stillPath?: string;
  duration?: string;
}

export interface VideoFilterDto {
  page?: number;
  limit?: number;
  search?: string;
  deleted?: boolean;
  class?: string;
  showId?: number;
  seasonNumber?: number;
  episodeNumber?: number;
  originalLanguage?: string;
}

export interface VideoResponseDto {
  success: boolean;
  data?: VideoDto | VideoDto[];
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}
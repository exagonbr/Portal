export class CreateVideoDto {
  version?: string;
  title?: string;
  description?: string;
  filePath?: string;
  duration?: string;
  thumbnailUrl?: string;
  tvShowId?: string;
  episodeNumber?: string;
  seasonNumber?: string;
  isActive?: string;
}

export class UpdateVideoDto {
  version?: string;
  title?: string;
  description?: string;
  filePath?: string;
  duration?: string;
  thumbnailUrl?: string;
  tvShowId?: string;
  episodeNumber?: string;
  seasonNumber?: string;
  isActive?: string;
}

export class VideoResponseDto {
  id: string = "";
  version: string = "";
  title: string = "";
  description: string = "";
  filePath: string = "";
  duration: string = "";
  thumbnailUrl: string = "";
  tvShowId: string = "";
  episodeNumber: string = "";
  seasonNumber: string = "";
  isActive: string = "";
  createdAt: string = "";
  updatedAt: string = "";
}
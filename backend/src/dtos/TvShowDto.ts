export class CreateTvShowDto {
  version?: string;
  deleted?: string;
  name?: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: string;
  rating?: string;
  releaseYear?: string;
  isActive?: string;
}

export class UpdateTvShowDto {
  version?: string;
  deleted?: string;
  name?: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: string;
  rating?: string;
  releaseYear?: string;
  isActive?: string;
}

export class TvShowResponseDto {
  id: string = "";
  version: string = "";
  dateCreated: string = "";
  deleted: string = "";
  lastUpdated: string = "";
  name: string = "";
  description: string = "";
  thumbnailUrl: string = "";
  duration: string = "";
  rating: string = "";
  releaseYear: string = "";
  isActive: string = "";
}
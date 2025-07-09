export class CreateWatchlistEntryDto {
  userId?: string;
  videoId?: string;
  addedAt?: string;
  watched?: string;
}

export class UpdateWatchlistEntryDto {
  userId?: string;
  videoId?: string;
  addedAt?: string;
  watched?: string;
}

export class WatchlistEntryResponseDto {
  id: string = "";
  userId: string = "";
  videoId: string = "";
  addedAt: string = "";
  watched: string = "";
  createdAt: string = "";
  updatedAt: string = "";
}
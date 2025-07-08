export class CreateViewingStatusDto {
  userId?: string;
  videoId?: string;
  progressSeconds?: string;
  completed?: string;
  lastWatched?: string;
}

export class UpdateViewingStatusDto {
  userId?: string;
  videoId?: string;
  progressSeconds?: string;
  completed?: string;
  lastWatched?: string;
}

export class ViewingStatusResponseDto {
  id: string;
  userId: string;
  videoId: string;
  progressSeconds: string;
  completed: string;
  lastWatched: string;
  createdAt: string;
  updatedAt: string;
}
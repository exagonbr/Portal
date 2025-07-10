export class CreateNotificationQueueDto {
  version?: string = "";
  description?: string = "";
  isCompleted?: string = "";
  movieId?: string = "";
  tvShowId?: string = "";
  type?: string = "";
  videoToPlayId?: string = "";
}

export class UpdateNotificationQueueDto {
  version?: string = "";
  description?: string = "";
  isCompleted?: string = "";
  movieId?: string = "";
  tvShowId?: string = "";
  type?: string = "";
  videoToPlayId?: string = "";
}

export class NotificationQueueResponseDto {
  id: string = "";
  version: string = "";
  dateCreated: string = "";
  description: string = "";
  isCompleted: string = "";
  lastUpdated: string = "";
  movieId: string = "";
  tvShowId: string = "";
  type: string = "";
  videoToPlayId: string = "";
}
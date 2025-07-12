export class CreateActivitySummariesDto {
  userId?: string = "";
  date?: string = "";
  totalTimeSeconds?: string = "";
  pageViews?: string = "";
  videoTimeSeconds?: string = "";
  videosWatched?: string = "";
  quizzesAttempted?: string = "";
  assignmentsSubmitted?: string = "";
  loginCount?: string = "";
  uniqueSessions?: string = "";
}

export class UpdateActivitySummariesDto {
  userId?: string = "";
  date?: string = "";
  totalTimeSeconds?: string = "";
  pageViews?: string = "";
  videoTimeSeconds?: string = "";
  videosWatched?: string = "";
  quizzesAttempted?: string = "";
  assignmentsSubmitted?: string = "";
  loginCount?: string = "";
  uniqueSessions?: string = "";
}

export class ActivitySummariesResponseDto {
  id: string = "";
  userId: string = "";
  date: string = "";
  totalTimeSeconds: string = "";
  pageViews: string = "";
  videoTimeSeconds: string = "";
  videosWatched: string = "";
  quizzesAttempted: string = "";
  assignmentsSubmitted: string = "";
  loginCount: string = "";
  uniqueSessions: string = "";
  createdAt: string = "";
  updatedAt: string = "";
}
export class CreateActivitySessionsDto {
  sessionId?: string;
  userId?: string;
  startTime?: string;
  endTime?: string;
  durationSeconds?: string;
  pageViews?: string;
  actionsCount?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  isActive?: string;
  lastActivity?: string;
}

export class UpdateActivitySessionsDto {
  sessionId?: string;
  userId?: string;
  startTime?: string;
  endTime?: string;
  durationSeconds?: string;
  pageViews?: string;
  actionsCount?: string;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  isActive?: string;
  lastActivity?: string;
}

export class ActivitySessionsResponseDto {
  id: string;
  sessionId: string;
  userId: string;
  startTime: string;
  endTime: string;
  durationSeconds: string;
  pageViews: string;
  actionsCount: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo: string;
  isActive: string;
  lastActivity: string;
  createdAt: string;
  updatedAt: string;
}
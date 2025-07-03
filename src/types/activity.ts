export interface UserActivity {
  id: string
  user_id: string
  session_id?: string
  activity_type: ActivityType
  entity_type?: string
  entity_id?: string
  action: string
  details?: Record<string, any>
  ip_address?: string
  user_agent?: string
  device_info?: string
  browser?: string
  operating_system?: string
  location?: string
  duration_seconds?: number
  start_time?: Date
  end_time?: Date
  created_at: Date
  updated_at: Date
  
  // Campos legados para compatibilidade
  version?: number
  date_created?: Date
  last_updated?: Date
  type?: string
  video_id?: number
  institution_id?: string
  unit_id?: string
  fullname?: string
  institution_name?: string
  is_certified?: boolean
  username?: string
}

export interface ViewingStatus {
  id: string
  user_id: string
  video_id: number
  tv_show_id?: number
  profile_id?: string
  current_play_time: number
  runtime?: number
  completed: boolean
  watch_percentage: number
  last_position: number
  quality?: string
  playback_speed?: number
  subtitle_language?: string
  audio_language?: string
  device_type?: string
  created_at: Date
  updated_at: Date
  
  // Campos legados para compatibilidade
  version?: number
  date_created?: Date
  last_updated?: Date
}

export interface WatchlistEntry {
  id: string
  user_id: string
  video_id?: number
  tv_show_id?: number
  profile_id?: string
  added_at: Date
  is_deleted: boolean
  priority?: number
  notes?: string
  reminder_date?: Date
  created_at: Date
  updated_at: Date
  
  // Campos legados para compatibilidade
  version?: number
  date_created?: Date
  last_updated?: Date
}

export type ActivityType = 
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'page_view'
  | 'video_start'
  | 'video_play'
  | 'video_pause'
  | 'video_stop'
  | 'video_complete'
  | 'video_seek'
  | 'content_access'
  | 'quiz_start'
  | 'quiz_attempt'
  | 'quiz_complete'
  | 'assignment_start'
  | 'assignment_submit'
  | 'assignment_complete'
  | 'book_open'
  | 'book_read'
  | 'book_bookmark'
  | 'course_enroll'
  | 'course_complete'
  | 'lesson_start'
  | 'lesson_complete'
  | 'forum_post'
  | 'forum_reply'
  | 'chat_message'
  | 'file_download'
  | 'file_upload'
  | 'search'
  | 'profile_update'
  | 'settings_change'
  | 'notification_read'
  | 'session_timeout'
  | 'error'
  | 'system_action'

export interface ActivityTrackingOptions {
  trackPageViews?: boolean
  trackVideoEvents?: boolean
  trackUserInteractions?: boolean
  trackErrors?: boolean
  trackPerformance?: boolean
  sessionTimeout?: number // em minutos
  batchSize?: number
  flushInterval?: number // em segundos
}

export interface ActivitySession {
  session_id: string
  user_id: string
  start_time: Date
  end_time?: Date
  duration_seconds?: number
  page_views: number
  actions_count: number
  ip_address?: string
  user_agent?: string
  device_info?: string
  is_active: boolean
  last_activity: Date
}

export interface ActivitySummary {
  user_id: string
  date: string
  total_time_seconds: number
  page_views: number
  video_time_seconds: number
  videos_watched: number
  quizzes_attempted: number
  assignments_submitted: number
  login_count: number
  unique_sessions: number
}

export interface VideoWatchingActivity {
  user_id: string
  video_id: number
  tv_show_id?: number
  session_id: string
  start_time: Date
  end_time?: Date
  duration_watched_seconds: number
  total_duration_seconds: number
  completion_percentage: number
  quality: string
  playback_speed: number
  pauses_count: number
  seeks_count: number
  completed: boolean
}

export interface CreateActivityData {
  user_id: string
  activity_type: ActivityType
  entity_type?: string
  entity_id?: string
  action: string
  details?: Record<string, any>
  duration_seconds?: number
  session_id?: string
}

export interface ActivityFilter {
  user_id?: string
  activity_type?: ActivityType | ActivityType[]
  entity_type?: string
  entity_id?: string
  date_from?: Date
  date_to?: Date
  session_id?: string
  page?: number
  limit?: number
  sortBy?: keyof UserActivity
  sortOrder?: 'asc' | 'desc'
}

export interface ActivityStats {
  total_activities: number
  unique_users: number
  unique_sessions: number
  average_session_duration: number
  most_active_users: Array<{
    user_id: string
    user_name: string
    activity_count: number
  }>
  activity_by_type: Record<ActivityType, number>
  activity_by_hour: Record<string, number>
  activity_by_day: Record<string, number>
} 
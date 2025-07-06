export type ActivityType = 
  // Autenticação
  | 'login'
  | 'logout'
  | 'login_failed'
  | 'token_refresh'
  | 'password_reset'
  | 'password_change'
  
  // Navegação
  | 'page_view'
  | 'navigation'
  | 'session_start'
  | 'session_end'
  | 'session_timeout'
  
  // Vídeo
  | 'video_start'
  | 'video_pause'
  | 'video_resume'
  | 'video_complete'
  | 'video_seek'
  | 'video_speed_change'
  | 'video_quality_change'
  | 'video_fullscreen'
  | 'video_error'
  
  // Quiz/Avaliação
  | 'quiz_start'
  | 'quiz_complete'
  | 'quiz_attempt'
  | 'quiz_answer'
  | 'quiz_review'
  
  // Atividades/Tarefas
  | 'assignment_view'
  | 'assignment_start'
  | 'assignment_submit'
  | 'assignment_grade'
  
  // Dados
  | 'data_create'
  | 'data_update'
  | 'data_delete'
  | 'data_view'
  | 'data_export'
  | 'data_import'
  
  // Perfil
  | 'profile_view'
  | 'profile_update'
  | 'avatar_change'
  | 'settings_change'
  
  // Estatísticas
  | 'stats_view'
  | 'report_generate'
  | 'analytics_view'
  
  // Conteúdo
  | 'content_access'
  | 'content_download'
  | 'resource_view'
  | 'document_view'
  | 'book_access'
  | 'book_bookmark'
  
  // Social
  | 'forum_post'
  | 'forum_reply'
  | 'chat_message'
  
  // Sistema
  | 'file_download'
  | 'file_upload'
  | 'notification_read'
  | 'error'
  | 'system_action';

export interface UserActivity {
  id: string;
  user_id: string;
  session_id?: string;
  activity_type: ActivityType;
  entity_type?: string;
  entity_id?: string;
  action: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  device_info?: string;
  browser?: string;
  operating_system?: string;
  location?: string;
  duration_seconds?: number;
  start_time?: Date;
  end_time?: Date;
  created_at: Date;
  updated_at: Date;
  
  // Campos legados para compatibilidade
  version?: number;
  date_created?: Date;
  last_updated?: Date;
  type?: string;
  video_id?: number;
  institution_id?: string;
  unit_id?: string;
  fullname?: string;
  institution_name?: string;
  is_certified?: boolean;
  username?: string;
}

export interface ActivitySession {
  id: string;
  session_id: string;
  user_id: string;
  start_time: Date;
  end_time?: Date;
  duration_seconds?: number;
  page_views?: number;
  actions_count?: number;
  ip_address?: string;
  user_agent?: string;
  device_info?: Record<string, any>;
  is_active?: boolean;
  last_activity?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ActivitySummary {
  id: string;
  user_id: string;
  date: Date;
  total_time_seconds?: number;
  page_views?: number;
  video_time_seconds?: number;
  videos_watched?: number;
  quizzes_attempted?: number;
  assignments_submitted?: number;
  login_count?: number;
  unique_sessions?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateActivityData {
  user_id: string;
  activity_type: ActivityType;
  entity_type?: string;
  entity_id?: string;
  action: string;
  details?: Record<string, any>;
  duration_seconds?: number;
  session_id?: string;
} 
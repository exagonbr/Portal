import { 
  UserActivity, 
  ViewingStatus, 
  WatchlistEntry, 
  ActivityType, 
  CreateActivityData, 
  ActivityFilter, 
  ActivityStats,
  VideoWatchingActivity,
  ActivitySession,
  ActivitySummary,
  ActivityTrackingOptions
} from '@/types/activity'
import knex from '@/config/database'
import { v4 as uuidv4 } from 'uuid'

class ActivityTrackingService {
  private options: ActivityTrackingOptions
  private activityQueue: CreateActivityData[] = []
  private flushTimer: NodeJS.Timeout | null = null

  constructor(options: ActivityTrackingOptions = {}) {
    this.options = {
      trackPageViews: true,
      trackVideoEvents: true,
      trackUserInteractions: true,
      trackErrors: true,
      trackPerformance: false,
      sessionTimeout: 30, // 30 minutos
      batchSize: 50,
      flushInterval: 10, // 10 segundos
      ...options
    }

    // Iniciar timer de flush automático
    this.startFlushTimer()
  }

  // ===================== RASTREAMENTO DE ATIVIDADES =====================

  async trackActivity(data: CreateActivityData): Promise<void> {
    try {
      // Adicionar à fila
      this.activityQueue.push({
        ...data,
        session_id: data.session_id || this.generateSessionId()
      })

      // Flush se atingir o tamanho do lote
      if (this.activityQueue.length >= (this.options.batchSize || 50)) {
        await this.flushActivities()
      }
    } catch (error) {
      console.error('❌ Erro ao rastrear atividade:', error)
    }
  }

  async trackLogin(userId: string, details?: Record<string, any>): Promise<void> {
    await this.trackActivity({
      user_id: userId,
      activity_type: 'login',
      action: 'user_login',
      details: {
        timestamp: new Date().toISOString(),
        ...details
      }
    })
  }

  async trackLoginFailed(email: string, reason: string, details?: Record<string, any>): Promise<void> {
    await this.trackActivity({
      user_id: email, // Usar email como identificador para login falhado
      activity_type: 'login_failed',
      action: 'login_failed',
      details: {
        reason,
        timestamp: new Date().toISOString(),
        ...details
      }
    })
  }

  async trackLogout(userId: string, sessionDuration?: number): Promise<void> {
    await this.trackActivity({
      user_id: userId,
      activity_type: 'logout',
      action: 'user_logout',
      duration_seconds: sessionDuration,
      details: {
        timestamp: new Date().toISOString(),
        session_duration: sessionDuration
      }
    })
  }

  async trackPageView(userId: string, page: string, details?: Record<string, any>): Promise<void> {
    if (!this.options.trackPageViews) return

    await this.trackActivity({
      user_id: userId,
      activity_type: 'page_view',
      entity_type: 'page',
      entity_id: page,
      action: 'page_view',
      details: {
        page,
        timestamp: new Date().toISOString(),
        ...details
      }
    })
  }

  async trackVideoStart(userId: string, videoId: number, tvShowId?: number): Promise<void> {
    if (!this.options.trackVideoEvents) return

    await this.trackActivity({
      user_id: userId,
      activity_type: 'video_start',
      entity_type: 'video',
      entity_id: videoId.toString(),
      action: 'video_start',
      details: {
        video_id: videoId,
        tv_show_id: tvShowId,
        timestamp: new Date().toISOString()
      }
    })
  }

  async trackVideoProgress(userId: string, videoId: number, watchData: Partial<VideoWatchingActivity>): Promise<void> {
    if (!this.options.trackVideoEvents) return

    // Atualizar viewing_status
    await this.updateViewingStatus({
      user_id: userId,
      video_id: videoId,
      tv_show_id: watchData.tv_show_id,
      current_play_time: watchData.duration_watched_seconds || 0,
      runtime: watchData.total_duration_seconds,
      completed: watchData.completed || false,
      watch_percentage: watchData.completion_percentage || 0,
      last_position: watchData.duration_watched_seconds || 0,
      quality: watchData.quality,
      playback_speed: watchData.playback_speed,
      device_type: 'web'
    })

    // Rastrear atividade
    await this.trackActivity({
      user_id: userId,
      activity_type: 'video_play',
      entity_type: 'video',
      entity_id: videoId.toString(),
      action: 'video_progress',
      duration_seconds: watchData.duration_watched_seconds,
      details: {
        video_id: videoId,
        tv_show_id: watchData.tv_show_id,
        completion_percentage: watchData.completion_percentage,
        quality: watchData.quality,
        playback_speed: watchData.playback_speed,
        timestamp: new Date().toISOString()
      }
    })
  }

  async trackVideoComplete(userId: string, videoId: number, totalWatchTime: number): Promise<void> {
    if (!this.options.trackVideoEvents) return

    await this.trackActivity({
      user_id: userId,
      activity_type: 'video_complete',
      entity_type: 'video',
      entity_id: videoId.toString(),
      action: 'video_complete',
      duration_seconds: totalWatchTime,
      details: {
        video_id: videoId,
        total_watch_time: totalWatchTime,
        timestamp: new Date().toISOString()
      }
    })
  }

  async trackQuizAttempt(userId: string, quizId: string, score?: number, details?: Record<string, any>): Promise<void> {
    await this.trackActivity({
      user_id: userId,
      activity_type: 'quiz_attempt',
      entity_type: 'quiz',
      entity_id: quizId,
      action: 'quiz_attempt',
      details: {
        quiz_id: quizId,
        score,
        timestamp: new Date().toISOString(),
        ...details
      }
    })
  }

  async trackAssignmentSubmit(userId: string, assignmentId: string, details?: Record<string, any>): Promise<void> {
    await this.trackActivity({
      user_id: userId,
      activity_type: 'assignment_submit',
      entity_type: 'assignment',
      entity_id: assignmentId,
      action: 'assignment_submit',
      details: {
        assignment_id: assignmentId,
        timestamp: new Date().toISOString(),
        ...details
      }
    })
  }

  async trackError(userId: string, error: Error, context?: Record<string, any>): Promise<void> {
    if (!this.options.trackErrors) return

    await this.trackActivity({
      user_id: userId,
      activity_type: 'error',
      action: 'error_occurred',
      details: {
        error_message: error.message,
        error_stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      }
    })
  }

  // ===================== VIEWING STATUS =====================

  async updateViewingStatus(data: Partial<ViewingStatus> & { user_id: string; video_id: number }): Promise<void> {
    try {
      const existing = await knex('viewing_status')
        .where({ user_id: data.user_id, video_id: data.video_id })
        .first()

      const viewingData = {
        user_id: data.user_id,
        video_id: data.video_id,
        tv_show_id: data.tv_show_id,
        profile_id: data.profile_id,
        current_play_time: data.current_play_time || 0,
        runtime: data.runtime,
        completed: data.completed || false,
        watch_percentage: data.watch_percentage || 0,
        last_position: data.last_position || data.current_play_time || 0,
        quality: data.quality,
        playback_speed: data.playback_speed || 1.0,
        subtitle_language: data.subtitle_language,
        audio_language: data.audio_language,
        device_type: data.device_type || 'web',
        updated_at: new Date()
      }

      if (existing) {
        await knex('viewing_status')
          .where({ id: existing.id })
          .update(viewingData)
      } else {
        await knex('viewing_status').insert({
          id: uuidv4(),
          ...viewingData,
          created_at: new Date()
        })
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar viewing_status:', error)
    }
  }

  async getViewingStatus(userId: string, videoId: number): Promise<ViewingStatus | null> {
    try {
      const result = await knex('viewing_status')
        .where({ user_id: userId, video_id: videoId })
        .first()

      return result || null
    } catch (error) {
      console.error('❌ Erro ao buscar viewing_status:', error)
      return null
    }
  }

  // ===================== WATCHLIST =====================

  async addToWatchlist(userId: string, videoId?: number, tvShowId?: number, notes?: string): Promise<void> {
    try {
      const existing = await knex('watchlist_entry')
        .where({ 
          user_id: userId, 
          ...(videoId && { video_id: videoId }),
          ...(tvShowId && { tv_show_id: tvShowId }),
          is_deleted: false 
        })
        .first()

      if (!existing) {
        await knex('watchlist_entry').insert({
          id: uuidv4(),
          user_id: userId,
          video_id: videoId,
          tv_show_id: tvShowId,
          added_at: new Date(),
          is_deleted: false,
          notes,
          created_at: new Date(),
          updated_at: new Date()
        })
      }
    } catch (error) {
      console.error('❌ Erro ao adicionar à watchlist:', error)
    }
  }

  async removeFromWatchlist(userId: string, videoId?: number, tvShowId?: number): Promise<void> {
    try {
      await knex('watchlist_entry')
        .where({ 
          user_id: userId,
          ...(videoId && { video_id: videoId }),
          ...(tvShowId && { tv_show_id: tvShowId })
        })
        .update({ 
          is_deleted: true,
          updated_at: new Date()
        })
    } catch (error) {
      console.error('❌ Erro ao remover da watchlist:', error)
    }
  }

  // ===================== CONSULTAS E RELATÓRIOS =====================

  async getActivityStats(filter: ActivityFilter = {}): Promise<ActivityStats> {
    try {
      const query = this.buildActivityQuery(filter)

      const [
        totalActivities,
        uniqueUsers,
        uniqueSessions,
        activityByType,
        activityByHour,
        activityByDay,
        mostActiveUsers
      ] = await Promise.all([
        query.clone().count('* as count').first(),
        query.clone().countDistinct('user_id as count').first(),
        query.clone().countDistinct('session_id as count').first(),
        knex('user_activity').select('activity_type').count('* as count').groupBy('activity_type'),
        knex('user_activity').select(knex.raw('EXTRACT(HOUR FROM created_at) as hour')).count('* as count').groupBy('hour'),
        knex('user_activity').select(knex.raw('DATE(created_at) as day')).count('* as count').groupBy('day').orderBy('day'),
        knex('user_activity')
          .select('user_id')
          .count('* as activity_count')
          .groupBy('user_id')
          .orderBy('activity_count', 'desc')
          .limit(10)
      ])

      // Calcular duração média de sessão
      const sessionDurations = await knex('user_activity')
        .select('session_id')
        .min('created_at as start_time')
        .max('created_at as end_time')
        .whereNotNull('session_id')
        .groupBy('session_id')

      const averageSessionDuration = sessionDurations.length > 0 
        ? sessionDurations.reduce((sum, session) => {
            const duration = (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / 1000 / 60
            return sum + duration
          }, 0) / sessionDurations.length
        : 0

      // Criar objeto inicial com todas as ActivityType keys
      const initialActivityByType: Record<ActivityType, number> = {
        'login': 0, 'logout': 0, 'login_failed': 0, 'page_view': 0, 'video_start': 0,
        'video_play': 0, 'video_pause': 0, 'video_stop': 0, 'video_complete': 0, 'video_seek': 0,
        'content_access': 0, 'quiz_start': 0, 'quiz_attempt': 0, 'quiz_complete': 0,
        'assignment_start': 0, 'assignment_submit': 0, 'assignment_complete': 0,
        'book_open': 0, 'book_read': 0, 'book_bookmark': 0, 'course_enroll': 0, 'course_complete': 0,
        'lesson_start': 0, 'lesson_complete': 0, 'forum_post': 0, 'forum_reply': 0, 'chat_message': 0,
        'file_download': 0, 'file_upload': 0, 'search': 0, 'profile_update': 0, 'settings_change': 0,
        'notification_read': 0, 'session_timeout': 0, 'error': 0, 'system_action': 0
      };

      return {
        total_activities: parseInt(String(totalActivities?.count || '0')),
        unique_users: parseInt(String(uniqueUsers?.count || '0')),
        unique_sessions: parseInt(String(uniqueSessions?.count || '0')),
        average_session_duration: Math.round(averageSessionDuration),
        most_active_users: mostActiveUsers.map(user => ({
          user_id: String(user.user_id),
          user_name: '', // Seria necessário join com tabela users
          activity_count: parseInt(String(user.activity_count))
        })),
        activity_by_type: activityByType.reduce((acc, item) => {
          const activityType = item.activity_type as ActivityType;
          if (activityType in acc) {
            acc[activityType] = parseInt(String(item.count));
          }
          return acc;
        }, { ...initialActivityByType } as Record<ActivityType, number>),
        activity_by_hour: activityByHour.reduce((acc, item) => {
          acc[item.hour] = parseInt(String(item.count));
          return acc;
        }, {} as Record<string, number>),
        activity_by_day: activityByDay.reduce((acc, item) => {
          acc[item.day] = parseInt(String(item.count));
          return acc;
        }, {} as Record<string, number>)
      }
    } catch (error) {
      console.error('❌ Erro ao obter estatísticas de atividade:', error)
      throw error
    }
  }

  async getUserActivities(filter: ActivityFilter): Promise<{ activities: UserActivity[], total: number }> {
    try {
      const query = this.buildActivityQuery(filter)
      
      const [activities, totalResult] = await Promise.all([
        query
          .clone()
          .select('*')
          .orderBy(filter.sortBy || 'created_at', filter.sortOrder || 'desc')
          .limit(filter.limit || 50)
          .offset(((filter.page || 1) - 1) * (filter.limit || 50)),
        query.clone().count('* as count').first()
      ])

      return {
        activities,
        total: parseInt(String(totalResult?.count || '0'))
      }
    } catch (error) {
      console.error('❌ Erro ao buscar atividades do usuário:', error)
      throw error
    }
  }

  // ===================== MÉTODOS PRIVADOS =====================

  private buildActivityQuery(filter: ActivityFilter) {
    let query = knex('user_activity')

    if (filter.user_id) {
      query = query.where('user_id', filter.user_id)
    }

    if (filter.activity_type) {
      if (Array.isArray(filter.activity_type)) {
        query = query.whereIn('activity_type', filter.activity_type)
      } else {
        query = query.where('activity_type', filter.activity_type)
      }
    }

    if (filter.entity_type) {
      query = query.where('entity_type', filter.entity_type)
    }

    if (filter.entity_id) {
      query = query.where('entity_id', filter.entity_id)
    }

    if (filter.date_from) {
      query = query.where('created_at', '>=', filter.date_from)
    }

    if (filter.date_to) {
      query = query.where('created_at', '<=', filter.date_to)
    }

    if (filter.session_id) {
      query = query.where('session_id', filter.session_id)
    }

    return query
  }

  private async flushActivities(): Promise<void> {
    if (this.activityQueue.length === 0) return

    try {
      const activities = this.activityQueue.splice(0, this.options.batchSize || 50)
      
      const activitiesData = activities.map(activity => ({
        id: uuidv4(),
        user_id: activity.user_id,
        session_id: activity.session_id,
        activity_type: activity.activity_type,
        entity_type: activity.entity_type,
        entity_id: activity.entity_id,
        action: activity.action,
        details: JSON.stringify(activity.details || {}),
        duration_seconds: activity.duration_seconds,
        created_at: new Date(),
        updated_at: new Date()
      }))

      await knex('user_activity').insert(activitiesData)
      console.log(`✅ ${activitiesData.length} atividades salvas no banco`)
    } catch (error) {
      console.error('❌ Erro ao salvar atividades:', error)
      // Recolocar atividades na fila em caso de erro
      // this.activityQueue.unshift(...activities)
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }

    this.flushTimer = setInterval(() => {
      this.flushActivities()
    }, (this.options.flushInterval || 10) * 1000)
  }

  private generateSessionId(): string {
    return uuidv4()
  }

  // ===================== CLEANUP =====================

  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
      this.flushTimer = null
    }
    
    // Flush final
    this.flushActivities()
  }
}

// Instância singleton
export const activityTracker = new ActivityTrackingService()

export default ActivityTrackingService 
import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ActivityType, VideoWatchingActivity } from '@/types/activity'

interface UseActivityTrackingOptions {
  trackPageViews?: boolean
  trackVideoEvents?: boolean
  trackUserInteractions?: boolean
  trackErrors?: boolean
  sessionTimeout?: number
}

interface ActivityTrackingAPI {
  trackActivity: (type: ActivityType, details?: Record<string, any>) => Promise<void>
  trackPageView: (page: string, details?: Record<string, any>) => Promise<void>
  trackVideoStart: (videoId: number, tvShowId?: number) => Promise<void>
  trackVideoProgress: (videoId: number, watchData: Partial<VideoWatchingActivity>) => Promise<void>
  trackVideoComplete: (videoId: number, totalWatchTime: number) => Promise<void>
  trackQuizAttempt: (quizId: string, score?: number, details?: Record<string, any>) => Promise<void>
  trackAssignmentSubmit: (assignmentId: string, details?: Record<string, any>) => Promise<void>
  trackError: (error: Error, context?: Record<string, any>) => Promise<void>
  addToWatchlist: (videoId?: number, tvShowId?: number, notes?: string) => Promise<void>
  removeFromWatchlist: (videoId?: number, tvShowId?: number) => Promise<void>
}

export function useActivityTracking(options: UseActivityTrackingOptions = {}): ActivityTrackingAPI {
  const { user } = useAuth()
  const sessionIdRef = useRef<string>()
  const pageStartTimeRef = useRef<Date>()
  const videoStartTimeRef = useRef<Record<number, Date>>({})
  
  const {
    trackPageViews = true,
    trackVideoEvents = true,
    trackUserInteractions = true,
    trackErrors = true,
    sessionTimeout = 30
  } = options

  // Gerar session ID único
  useEffect(() => {
    if (user && !sessionIdRef.current) {
      sessionIdRef.current = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }, [user])

  // Rastrear início da página
  useEffect(() => {
    if (trackPageViews && user) {
      pageStartTimeRef.current = new Date()
      trackPageView(window.location.pathname)
    }
  }, [user, trackPageViews])

  // Rastrear mudanças de página
  useEffect(() => {
    if (!trackPageViews || !user) return

    const handleRouteChange = () => {
      trackPageView(window.location.pathname)
      pageStartTimeRef.current = new Date()
    }

    // Para Next.js Router
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', handleRouteChange)
      
      // Interceptar mudanças de rota do Next.js
      const originalPushState = window.history.pushState
      const originalReplaceState = window.history.replaceState

      window.history.pushState = function(...args) {
        originalPushState.apply(window.history, args)
        handleRouteChange()
      }

      window.history.replaceState = function(...args) {
        originalReplaceState.apply(window.history, args)
        handleRouteChange()
      }

      return () => {
        window.removeEventListener('popstate', handleRouteChange)
        window.history.pushState = originalPushState
        window.history.replaceState = originalReplaceState
      }
    }
  }, [trackPageViews, user])

  // Rastrear erros globais
  useEffect(() => {
    if (!trackErrors || !user) return

    const handleError = (event: ErrorEvent) => {
      trackError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      trackError(new Error(event.reason), {
        type: 'unhandled_promise_rejection',
        reason: event.reason
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [trackErrors, user])

  // Função principal para rastrear atividades
  const trackActivity = useCallback(async (type: ActivityType, details: Record<string, any> = {}) => {
    if (!user) return

    try {
      await fetch('/api/activity/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          activity_type: type,
          action: type,
          session_id: sessionIdRef.current,
          details: {
            ...details,
            url: window.location.href,
            user_agent: navigator.userAgent,
            timestamp: new Date().toISOString()
          }
        })
      })
    } catch (error) {
      console.error('❌ Erro ao rastrear atividade:', error)
    }
  }, [user])

  const trackPageView = useCallback(async (page: string, details: Record<string, any> = {}) => {
    if (!trackPageViews || !user) return

    const timeOnPreviousPage = pageStartTimeRef.current 
      ? (new Date().getTime() - pageStartTimeRef.current.getTime()) / 1000
      : 0

    await trackActivity('page_view', {
      page,
      time_on_previous_page: timeOnPreviousPage,
      ...details
    })
  }, [trackActivity, trackPageViews, user])

  const trackVideoStart = useCallback(async (videoId: number, tvShowId?: number) => {
    if (!trackVideoEvents || !user) return

    videoStartTimeRef.current[videoId] = new Date()
    
    await trackActivity('video_start', {
      video_id: videoId,
      tv_show_id: tvShowId,
      entity_type: 'video',
      entity_id: videoId.toString()
    })
  }, [trackActivity, trackVideoEvents, user])

  const trackVideoProgress = useCallback(async (videoId: number, watchData: Partial<VideoWatchingActivity>) => {
    if (!trackVideoEvents || !user) return

    try {
      // Atualizar viewing_status
      await fetch('/api/activity/viewing-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          video_id: videoId,
          ...watchData
        })
      })

      // Rastrear atividade
      await trackActivity('video_play', {
        video_id: videoId,
        tv_show_id: watchData.tv_show_id,
        completion_percentage: watchData.completion_percentage,
        quality: watchData.quality,
        playback_speed: watchData.playback_speed,
        entity_type: 'video',
        entity_id: videoId.toString()
      })
    } catch (error) {
      console.error('❌ Erro ao rastrear progresso do vídeo:', error)
    }
  }, [trackActivity, trackVideoEvents, user])

  const trackVideoComplete = useCallback(async (videoId: number, totalWatchTime: number) => {
    if (!trackVideoEvents || !user) return

    const startTime = videoStartTimeRef.current[videoId]
    const sessionDuration = startTime 
      ? (new Date().getTime() - startTime.getTime()) / 1000
      : totalWatchTime

    await trackActivity('video_complete', {
      video_id: videoId,
      total_watch_time: totalWatchTime,
      session_duration: sessionDuration,
      entity_type: 'video',
      entity_id: videoId.toString()
    })

    // Limpar tempo de início
    delete videoStartTimeRef.current[videoId]
  }, [trackActivity, trackVideoEvents, user])

  const trackQuizAttempt = useCallback(async (quizId: string, score?: number, details: Record<string, any> = {}) => {
    if (!user) return

    await trackActivity('quiz_attempt', {
      quiz_id: quizId,
      score,
      entity_type: 'quiz',
      entity_id: quizId,
      ...details
    })
  }, [trackActivity, user])

  const trackAssignmentSubmit = useCallback(async (assignmentId: string, details: Record<string, any> = {}) => {
    if (!user) return

    await trackActivity('assignment_submit', {
      assignment_id: assignmentId,
      entity_type: 'assignment',
      entity_id: assignmentId,
      ...details
    })
  }, [trackActivity, user])

  const trackError = useCallback(async (error: Error, context: Record<string, any> = {}) => {
    if (!trackErrors || !user) return

    await trackActivity('error', {
      error_message: error.message,
      error_stack: error.stack,
      context,
      page: window.location.pathname
    })
  }, [trackActivity, trackErrors, user])

  const addToWatchlist = useCallback(async (videoId?: number, tvShowId?: number, notes?: string) => {
    if (!user) return

    try {
      await fetch('/api/activity/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          video_id: videoId,
          tv_show_id: tvShowId,
          notes
        })
      })

      await trackActivity('content_access', {
        action: 'add_to_watchlist',
        video_id: videoId,
        tv_show_id: tvShowId,
        notes
      })
    } catch (error) {
      console.error('❌ Erro ao adicionar à watchlist:', error)
    }
  }, [trackActivity, user])

  const removeFromWatchlist = useCallback(async (videoId?: number, tvShowId?: number) => {
    if (!user) return

    try {
      await fetch('/api/activity/watchlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          video_id: videoId,
          tv_show_id: tvShowId
        })
      })

      await trackActivity('content_access', {
        action: 'remove_from_watchlist',
        video_id: videoId,
        tv_show_id: tvShowId
      })
    } catch (error) {
      console.error('❌ Erro ao remover da watchlist:', error)
    }
  }, [trackActivity, user])

  return {
    trackActivity,
    trackPageView,
    trackVideoStart,
    trackVideoProgress,
    trackVideoComplete,
    trackQuizAttempt,
    trackAssignmentSubmit,
    trackError,
    addToWatchlist,
    removeFromWatchlist
  }
}

export default useActivityTracking 
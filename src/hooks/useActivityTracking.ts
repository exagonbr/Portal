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

  // Função para obter ID do usuário do localStorage, sessionStorage ou cookies se não estiver disponível no contexto
  const getUserId = useCallback((): string | null => {
    // Primeiro tenta obter do contexto de autenticação
    if (user?.id) {
      console.log('✅ user_id obtido do contexto de autenticação:', user.id);
      return user.id.toString()
    }
    
    // Se não estiver disponível, tenta obter do localStorage
    try {
      // Verificar localStorage - user
      const userStr = localStorage.getItem('user')
      if (userStr) {
        const userData = JSON.parse(userStr)
        if (userData && userData.id) {
          console.log('✅ user_id obtido do localStorage (user):', userData.id);
          return userData.id.toString()
        }
      }
      
      // Verificar sessionStorage - user
      const userStrSession = sessionStorage.getItem('user')
      if (userStrSession) {
        const userData = JSON.parse(userStrSession)
        if (userData && userData.id) {
          console.log('✅ user_id obtido do sessionStorage (user):', userData.id);
          return userData.id.toString()
        }
      }
      
      // Verificar localStorage - session_data
      const sessionDataStr = localStorage.getItem('session_data')
      if (sessionDataStr) {
        const sessionData = JSON.parse(sessionDataStr)
        if (sessionData && sessionData.user_id) {
          console.log('✅ user_id obtido do localStorage (session_data.user_id):', sessionData.user_id);
          return sessionData.user_id.toString()
        }
        if (sessionData && sessionData.userId) {
          console.log('✅ user_id obtido do localStorage (session_data.userId):', sessionData.userId);
          return sessionData.userId.toString()
        }
      }
      
      // Verificar sessionStorage - session_data
      const sessionDataStrSession = sessionStorage.getItem('session_data')
      if (sessionDataStrSession) {
        const sessionData = JSON.parse(sessionDataStrSession)
        if (sessionData && sessionData.user_id) {
          console.log('✅ user_id obtido do sessionStorage (session_data.user_id):', sessionData.user_id);
          return sessionData.user_id.toString()
        }
        if (sessionData && sessionData.userId) {
          console.log('✅ user_id obtido do sessionStorage (session_data.userId):', sessionData.userId);
          return sessionData.userId.toString()
        }
      }
      
      // Verificar cookies - user_data
      const cookies = document.cookie.split('; ')
      const userDataCookie = cookies.find(c => c.startsWith('user_data='))
      if (userDataCookie) {
        const userData = JSON.parse(decodeURIComponent(userDataCookie.split('=')[1]))
        if (userData && userData.id) {
          console.log('✅ user_id obtido do cookie user_data:', userData.id);
          return userData.id.toString()
        }
      }
      
      // Verificar cookies - session_data
      const sessionDataCookie = cookies.find(c => c.startsWith('session_data='))
      if (sessionDataCookie) {
        const sessionData = JSON.parse(decodeURIComponent(sessionDataCookie.split('=')[1]))
        if (sessionData && sessionData.user_id) {
          console.log('✅ user_id obtido do cookie session_data (user_id):', sessionData.user_id);
          return sessionData.user_id.toString()
        }
        if (sessionData && sessionData.userId) {
          console.log('✅ user_id obtido do cookie session_data (userId):', sessionData.userId);
          return sessionData.userId.toString()
        }
      }
      
      // Verificar cookies - user
      const userCookie = cookies.find(c => c.startsWith('user='))
      if (userCookie) {
        const userData = JSON.parse(decodeURIComponent(userCookie.split('=')[1]))
        if (userData && userData.id) {
          console.log('✅ user_id obtido do cookie user:', userData.id);
          return userData.id.toString()
        }
      }
      
    } catch (error) {
      console.log('❌ Erro ao obter user_id do armazenamento:', error)
    }
    
    console.log('❌ user_id não encontrado em nenhuma fonte')
    return null
  }, [user])

  // Função principal para rastrear atividades
  const trackActivity = useCallback(async (type: ActivityType, details: Record<string, any> = {}) => {
    const userId = getUserId()
    
    if (!userId) {
      console.log('❌ Ignorando log de atividade: user_id é nulo ou vazio')
      return
    }

    try {
      await fetch('/api/activity/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
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
      console.log('❌ Erro ao rastrear atividade:', error)
    }
  }, [getUserId])

  const trackPageView = useCallback(async (page: string, details: Record<string, any> = {}) => {
    if (!trackPageViews) return

    const timeOnPreviousPage = pageStartTimeRef.current 
      ? (new Date().getTime() - pageStartTimeRef.current.getTime()) / 1000
      : 0

    await trackActivity('page_view', {
      page,
      time_on_previous_page: timeOnPreviousPage,
      ...details
    })
  }, [trackActivity, trackPageViews])

  const trackVideoStart = useCallback(async (videoId: number, tvShowId?: number) => {
    if (!trackVideoEvents) return

    videoStartTimeRef.current[videoId] = new Date()
    
    await trackActivity('video_start', {
      video_id: videoId,
      tv_show_id: tvShowId,
      entity_type: 'video',
      entity_id: videoId.toString()
    })
  }, [trackActivity, trackVideoEvents])

  const trackVideoProgress = useCallback(async (videoId: number, watchData: Partial<VideoWatchingActivity>) => {
    if (!trackVideoEvents) return

    const userId = getUserId()
    if (!userId) {
      console.log('❌ Ignorando log de progresso de vídeo: user_id é nulo ou vazio')
      return
    }

    try {
      // Atualizar viewing_status
      await fetch('/api/activity/viewing-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
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
      console.log('❌ Erro ao rastrear progresso do vídeo:', error)
    }
  }, [trackActivity, trackVideoEvents, getUserId])

  const trackVideoComplete = useCallback(async (videoId: number, totalWatchTime: number) => {
    if (!trackVideoEvents) return

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
  }, [trackActivity, trackVideoEvents])

  const trackQuizAttempt = useCallback(async (quizId: string, score?: number, details: Record<string, any> = {}) => {
    await trackActivity('quiz_attempt', {
      quiz_id: quizId,
      score,
      entity_type: 'quiz',
      entity_id: quizId,
      ...details
    })
  }, [trackActivity])

  const trackAssignmentSubmit = useCallback(async (assignmentId: string, details: Record<string, any> = {}) => {
    await trackActivity('assignment_submit', {
      assignment_id: assignmentId,
      entity_type: 'assignment',
      entity_id: assignmentId,
      ...details
    })
  }, [trackActivity])

  const trackError = useCallback(async (error: Error, context: Record<string, any> = {}) => {
    if (!trackErrors) return

    await trackActivity('error', {
      error_message: error.message,
      error_stack: error.stack,
      context,
      page: window.location.pathname
    })
  }, [trackActivity, trackErrors])

  const addToWatchlist = useCallback(async (videoId?: number, tvShowId?: number, notes?: string) => {
    const userId = getUserId()
    if (!userId) {
      console.log('❌ Ignorando adição à watchlist: user_id é nulo ou vazio')
      return
    }

    try {
      await fetch('/api/activity/watchlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
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
      console.log('❌ Erro ao adicionar à watchlist:', error)
    }
  }, [trackActivity, getUserId])

  const removeFromWatchlist = useCallback(async (videoId?: number, tvShowId?: number) => {
    const userId = getUserId()
    if (!userId) {
      console.log('❌ Ignorando remoção da watchlist: user_id é nulo ou vazio')
      return
    }

    try {
      await fetch('/api/activity/watchlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
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
      console.log('❌ Erro ao remover da watchlist:', error)
    }
  }, [trackActivity, getUserId])

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
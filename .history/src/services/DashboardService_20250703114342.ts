import { UserRepository } from '../repositories/UserRepository'
import { SessionService } from './SessionService'
import { apiClient } from '@/lib/api-client'

interface DashboardStats {
  users: {
    total: number
    active: number
    newToday: number
  }
  sessions: {
    activeUsers: number
    totalActiveSessions: number
    sessionsByDevice: Record<string, number>
    averageSessionDuration: number
  }
  activities: {
    total: number
    todayTotal: number
    byType: Record<string, number>
  }
}

interface AnalyticsData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
  }[]
}

interface RecentActivity {
  id: string
  type: 'course_completion' | 'new_user' | 'book_read' | 'assignment_submitted'
  title: string
  description: string
  timestamp: string
  user?: string
}

interface UpcomingEvent {
  id: string
  title: string
  type: 'class' | 'exam' | 'assignment' | 'meeting'
  date: string
  time: string
  location?: string
}

export class DashboardService {
  private static userRepository = UserRepository

  public static async getDashboardStats(): Promise<DashboardStats> {
    try {
      // Estatísticas de usuários
      const userStats = await this.getUserStats()

      // Estatísticas de sessões
      const sessionStats = await this.getSessionStats()

      // Estatísticas de atividades
      const activityStats = await this.getActivityStats()

      return {
        users: userStats,
        sessions: sessionStats,
        activities: activityStats
      }
    } catch (error: unknown) {
      console.error('Erro ao obter estatísticas do dashboard:', error)
      throw new Error('Erro ao obter estatísticas do dashboard')
    }
  }

  private static async getUserStats(institutionId?: string): Promise<{ total: number; active: number; newToday: number }> {
    try {
      const totalUsers = await this.userRepository.countUsers(institutionId ? { institutionId } : {})
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const newUsers = await this.userRepository.countUsers({
        ...(institutionId ? { institutionId } : {}),
        dateCreated: { $gte: today }
      })

      const activeUsers = await SessionService.getActiveUsersCount()

      return {
        total: totalUsers,
        active: activeUsers,
        newToday: newUsers
      }
    } catch (error: unknown) {
      console.error('Erro ao obter estatísticas de usuários:', error)
      throw new Error('Erro ao obter estatísticas de usuários')
    }
  }

  private static async getSessionStats(): Promise<{
    activeUsers: number
    totalActiveSessions: number
    sessionsByDevice: Record<string, number>
    averageSessionDuration: number
  }> {
    try {
      const activeUsers = await SessionService.getActiveUsersCount()
      const totalActiveSessions = await SessionService.getActiveSessionsCount()
      const sessionsByDevice = await SessionService.getSessionsByDevice()
      const averageSessionDuration = await this.calculateAverageSessionDuration()

      return {
        activeUsers,
        totalActiveSessions,
        sessionsByDevice,
        averageSessionDuration
      }
    } catch (error: unknown) {
      console.error('Erro ao obter estatísticas de sessões:', error)
      throw new Error('Erro ao obter estatísticas de sessões')
    }
  }

  private static async getActivityStats(): Promise<{
    total: number
    todayTotal: number
    byType: Record<string, number>
  }> {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // TODO: Implementar lógica real de atividades
      return {
        total: 0,
        todayTotal: 0,
        byType: {}
      }
    } catch (error: unknown) {
      console.error('Erro ao obter estatísticas de atividades:', error)
      throw new Error('Erro ao obter estatísticas de atividades')
    }
  }

  private static async calculateAverageSessionDuration(): Promise<number> {
    try {
      const sessions = await SessionService.getAllActiveSessions()
      if (!sessions.length) return 0

      const durations = sessions.map(session => {
        const start = new Date(session.startTime).getTime()
        const end = session.endTime ? new Date(session.endTime).getTime() : Date.now()
        return (end - start) / 1000 // duração em segundos
      })

      const totalDuration = durations.reduce((acc, curr) => acc + curr, 0)
      return Math.round(totalDuration / sessions.length)
    } catch (error: unknown) {
      console.error('Erro ao calcular duração média das sessões:', error)
      return 0
    }
  }

  public static async getAnalytics(type: 'users' | 'sessions' | 'activities', period: 'day' | 'week' | 'month'): Promise<AnalyticsData> {
    try {
      const endDate = new Date()
      let startDate = new Date()

      switch (period) {
        case 'day':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(startDate.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1)
          break
      }

      const labels: string[] = []
      const data: number[] = []
      const currentDate = new Date(startDate)

      while (currentDate <= endDate) {
        labels.push(currentDate.toISOString().split('T')[0])
        
        // TODO: Implementar lógica real de coleta de dados
        data.push(Math.floor(Math.random() * 100))

        currentDate.setDate(currentDate.getDate() + 1)
      }

      return {
        labels,
        datasets: [{
          label: type.charAt(0).toUpperCase() + type.slice(1),
          data
        }]
      }
    } catch (error: unknown) {
      console.error(`Erro ao obter analytics de ${type}:`, error)
      throw new Error(`Erro ao obter analytics de ${type}`)
    }
  }

  public static async getRecentActivities(): Promise<RecentActivity[]> {
    try {
      const response = await apiClient.get<RecentActivity[]>('/dashboard/activities')
      return response.data || []
    } catch (error: unknown) {
      console.error('Erro ao buscar atividades recentes:', error)
      // Retornar dados mock em caso de erro
      return [
        {
          id: '1',
          type: 'course_completion',
          title: 'Curso Concluído',
          description: 'Ana Silva concluiu o curso de Matemática Básica',
          timestamp: new Date().toISOString(),
          user: 'Ana Silva'
        },
        {
          id: '2',
          type: 'new_user',
          title: 'Novo Usuário',
          description: 'Carlos Santos se cadastrou na plataforma',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          user: 'Carlos Santos'
        },
        {
          id: '3',
          type: 'book_read',
          title: 'Livro Lido',
          description: 'Maria Oliveira terminou de ler "Introdução à Física"',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          user: 'Maria Oliveira'
        }
      ]
    }
  }

  public static async getUpcomingEvents(): Promise<UpcomingEvent[]> {
    try {
      const response = await apiClient.get<UpcomingEvent[]>('/dashboard/events')
      return response.data || []
    } catch (error: unknown) {
      console.error('Erro ao buscar eventos próximos:', error)
      // Retornar dados mock em caso de erro
      return [
        {
          id: '1',
          title: 'Aula de Matemática',
          type: 'class',
          date: new Date().toISOString(),
          time: '14:00',
          location: 'Sala 101'
        },
        {
          id: '2',
          title: 'Prova de Física',
          type: 'exam',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          time: '09:00',
          location: 'Laboratório 2'
        },
        {
          id: '3',
          title: 'Entrega do Projeto',
          type: 'assignment',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          time: '23:59'
        }
      ]
    }
  }
} 

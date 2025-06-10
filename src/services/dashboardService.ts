import api from './api'

interface DashboardStats {
  totalUsers: number
  totalCourses: number
  totalBooks: number
  totalInstitutions: number
  activeStudents: number
  completedCourses: number
  averageProgress: number
  monthlyGrowth: number
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

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/dashboard/stats')
      return response.data
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error)
      // Retornar dados mock em caso de erro
      return {
        totalUsers: 1250,
        totalCourses: 45,
        totalBooks: 320,
        totalInstitutions: 12,
        activeStudents: 890,
        completedCourses: 156,
        averageProgress: 78,
        monthlyGrowth: 12
      }
    }
  },

  async getRecentActivities(): Promise<RecentActivity[]> {
    try {
      const response = await api.get('/dashboard/activities')
      return response.data
    } catch (error) {
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
  },

  async getUpcomingEvents(): Promise<UpcomingEvent[]> {
    try {
      const response = await api.get('/dashboard/events')
      return response.data
    } catch (error) {
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
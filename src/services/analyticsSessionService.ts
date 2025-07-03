import { ActiveSession } from '@/types/analytics'

class AnalyticsSessionService {
  // Simular obtenção de sessões ativas (em produção, isso viria do Redis ou banco de dados)
  async getActiveSessions(): Promise<ActiveSession[]> {
    await new Promise(resolve => setTimeout(resolve, 300))

    const sessions: ActiveSession[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'João Silva',
        userRole: 'Professor',
        userAvatar: undefined,
        ip: '192.168.1.100',
        location: 'São Paulo, BR',
        device: 'Windows',
        browser: 'Chrome',
        startTime: new Date(Date.now() - 45 * 60 * 1000), // 45 minutos atrás
        lastActivity: new Date(Date.now() - 2 * 60 * 1000), // 2 minutos atrás
        duration: 45,
        status: 'active'
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'Maria Santos',
        userRole: 'Aluno',
        userAvatar: undefined,
        ip: '192.168.1.101',
        location: 'Rio de Janeiro, BR',
        device: 'MacOS',
        browser: 'Safari',
        startTime: new Date(Date.now() - 120 * 60 * 1000), // 2 horas atrás
        lastActivity: new Date(Date.now() - 15 * 60 * 1000), // 15 minutos atrás
        duration: 120,
        status: 'idle'
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'Pedro Oliveira',
        userRole: 'Coordenador',
        userAvatar: undefined,
        ip: '192.168.1.102',
        location: 'Belo Horizonte, BR',
        device: 'Linux',
        browser: 'Firefox',
        startTime: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
        lastActivity: new Date(Date.now() - 1 * 60 * 1000), // 1 minuto atrás
        duration: 30,
        status: 'active'
      },
      {
        id: '4',
        userId: 'user4',
        userName: 'Ana Costa',
        userRole: 'Aluno',
        userAvatar: undefined,
        ip: '192.168.1.103',
        location: 'Salvador, BR',
        device: 'Android',
        browser: 'Chrome Mobile',
        startTime: new Date(Date.now() - 60 * 60 * 1000), // 1 hora atrás
        lastActivity: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
        duration: 60,
        status: 'away'
      },
      {
        id: '5',
        userId: 'user5',
        userName: 'Carlos Mendes',
        userRole: 'Professor',
        userAvatar: undefined,
        ip: '192.168.1.104',
        location: 'Porto Alegre, BR',
        device: 'iOS',
        browser: 'Safari Mobile',
        startTime: new Date(Date.now() - 90 * 60 * 1000), // 1.5 horas atrás
        lastActivity: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
        duration: 90,
        status: 'active'
      }
    ]

    return sessions
  }

  // Terminar sessão
  async terminateSession(sessionId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 200))
    // Em produção, isso removeria a sessão do Redis/banco
    return true
  }

  // Obter estatísticas de sessões
  async getSessionStats(): Promise<{
    totalActive: number
    byRole: Record<string, number>
    byDevice: Record<string, number>
    averageDuration: number
  }> {
    const sessions = await this.getActiveSessions()
    
    const stats = {
      totalActive: sessions.filter(s => s.status === 'active').length,
      byRole: {} as Record<string, number>,
      byDevice: {} as Record<string, number>,
      averageDuration: 0
    }

    let totalDuration = 0

    sessions.forEach(session => {
      // Por role
      stats.byRole[session.userRole] = (stats.byRole[session.userRole] || 0) + 1
      
      // Por dispositivo
      stats.byDevice[session.device] = (stats.byDevice[session.device] || 0) + 1
      
      // Duração total
      totalDuration += session.duration
    })

    stats.averageDuration = sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0

    return stats
  }
}

export const analyticsSessionService = new AnalyticsSessionService() 
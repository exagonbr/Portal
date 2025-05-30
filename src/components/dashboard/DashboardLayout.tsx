'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import DashboardSidebar from '@/components/dashboard/DashboardSidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showActivities, setShowActivities] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  // Mock data para notificações - em produção viria de uma API
  const notifications = [
    {
      id: 1,
      title: 'Nova atividade disponível',
      message: 'Matemática - Lista de exercícios 3',
      time: '2h atrás',
      read: false,
      type: 'info' as const
    },
    {
      id: 2,
      title: 'Nota publicada',
      message: 'História - Prova do 2º bimestre',
      time: '4h atrás',
      read: false,
      type: 'success' as const
    },
    {
      id: 3,
      title: 'Reunião de pais',
      message: 'Agendada para 20/06 às 19h',
      time: '1d atrás',
      read: true,
      type: 'warning' as const
    }
  ]

  const activities = [
    {
      id: '1',
      type: 'assignment' as const,
      title: 'Matemática - Lista 3',
      description: 'Entrega até 15/06',
      time: '2h',
      priority: 'high' as const
    },
    {
      id: '2',
      type: 'grade' as const,
      title: 'Nota Publicada',
      description: 'História - Prova Bimestral',
      time: '4h',
      priority: 'medium' as const
    },
    {
      id: '3',
      type: 'message' as const,
      title: 'Nova Mensagem',
      description: 'Prof. Silva enviou uma mensagem',
      time: '1d',
      priority: 'low' as const
    }
  ]

  const calendarEvents = [
    { id: 1, title: 'Prova de Matemática', date: '15 Jun, 14:00', color: 'bg-accent-blue' },
    { id: 2, title: 'Reunião de Pais', date: '20 Jun, 19:00', color: 'bg-warning' },
    { id: 3, title: 'Entrega de Projeto', date: '25 Jun, 23:59', color: 'bg-success' }
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return 'check_circle'
      case 'warning': return 'warning'
      case 'error': return 'error'
      default: return 'info'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-success'
      case 'warning': return 'text-warning'
      case 'error': return 'text-error'
      default: return 'text-accent-blue'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'assignment': return 'assignment'
      case 'grade': return 'grade'
      case 'message': return 'mail'
      case 'announcement': return 'campaign'
      default: return 'assignment'
    }
  }

  const getActivityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-error'
      case 'medium': return 'text-warning'
      case 'low': return 'text-accent-blue'
      default: return 'text-accent-blue'
    }
  }

  // Fechar dropdowns quando clicar fora
  const handleClickOutside = () => {
    setShowNotifications(false)
    setShowActivities(false)
    setShowCalendar(false)
    setShowUserMenu(false)
  }

  return (
    <div className="flex h-screen w-screen bg-background-secondary" onClick={handleClickOutside}>
      {/* Left Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-background-primary shadow-sm border-b border-border flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-semibold text-text-primary truncate">
                  Portal Educacional Sabercon
                </h1>
                <p className="text-sm text-text-secondary truncate">
                  Bem-vindo(a), {user?.name}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                {/* Atividades/Tarefas */}
                <div className="relative">
                  <button
                    className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-tertiary rounded-lg transition-colors relative"
                    title="Atividades"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowActivities(!showActivities)
                      setShowNotifications(false)
                      setShowCalendar(false)
                      setShowUserMenu(false)
                    }}
                  >
                    <span className="material-symbols-outlined">assignment</span>
                    {activities.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-blue text-white text-xs rounded-full flex items-center justify-center">
                        {activities.length}
                      </span>
                    )}
                  </button>

                  {/* Dropdown de Atividades */}
                  {showActivities && (
                    <div
                      className="absolute right-0 mt-2 w-80 bg-background-primary border border-border rounded-lg shadow-xl z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-text-primary">Atividades Recentes</h3>
                          <span className="text-xs text-text-secondary">{activities.length} itens</span>
                        </div>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto p-4">
                        <div className="space-y-3">
                          {activities.map((activity) => (
                            <div
                              key={activity.id}
                              className="p-3 rounded-lg bg-background-secondary border border-border hover:shadow-sm transition-shadow cursor-pointer"
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0`}>
                                  <span className={`material-symbols-outlined text-[16px] ${getActivityColor(activity.priority)}`}>
                                    {getActivityIcon(activity.type)}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-text-primary truncate">
                                    {activity.title}
                                  </p>
                                  <p className="text-xs text-text-secondary mt-1">
                                    {activity.description}
                                  </p>
                                  <p className="text-xs text-text-tertiary mt-1">
                                    há {activity.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <button
                          className="w-full mt-4 py-2 text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
                          onClick={() => {
                            setShowActivities(false)
                            // Navegar para página de atividades
                          }}
                        >
                          Ver todas as atividades
                        </button>
                      </div>
                      
                      {activities.length === 0 && (
                        <div className="p-8 text-center">
                          <span className="material-symbols-outlined text-4xl text-text-tertiary mb-2">
                            assignment_turned_in
                          </span>
                          <p className="text-sm text-text-secondary">Nenhuma atividade pendente</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Agenda/Calendário */}
                <div className="relative">
                  <button
                    className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-tertiary rounded-lg transition-colors"
                    title="Agenda"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowCalendar(!showCalendar)
                      setShowNotifications(false)
                      setShowActivities(false)
                      setShowUserMenu(false)
                    }}
                  >
                    <span className="material-symbols-outlined">calendar_month</span>
                  </button>

                  {/* Dropdown de Calendário */}
                  {showCalendar && (
                    <div
                      className="absolute right-0 mt-2 w-80 bg-background-primary border border-border rounded-lg shadow-xl z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-text-primary">Próximos Eventos</h3>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        {/* Mini Calendar */}
                        <div className="bg-background-secondary rounded-lg border border-border p-3 mb-4">
                          <div className="text-center mb-3">
                            <h4 className="text-sm font-medium text-text-primary">Junho 2025</h4>
                          </div>
                          
                          <div className="grid grid-cols-7 gap-1 text-xs">
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, idx) => (
                              <div key={idx} className="text-center text-text-tertiary font-medium py-1">
                                {day}
                              </div>
                            ))}
                            
                            {/* Calendar days */}
                            {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                              <div
                                key={day}
                                className={`text-center py-1 rounded transition-colors cursor-pointer ${
                                  day === 15
                                    ? 'bg-accent-blue text-white'
                                    : day === 20
                                    ? 'bg-warning/20 text-warning'
                                    : 'text-text-secondary hover:bg-background-tertiary'
                                }`}
                              >
                                {day}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Upcoming Events */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-text-primary">Próximos</h4>
                          
                          <div className="space-y-2">
                            {calendarEvents.map((event) => (
                              <div key={event.id} className="p-2 rounded-lg bg-background-secondary border border-border hover:shadow-sm transition-shadow cursor-pointer">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-2 h-2 rounded-full ${event.color}`}></div>
                                  <div className="flex-1">
                                    <p className="text-xs font-medium text-text-primary">{event.title}</p>
                                    <p className="text-xs text-text-secondary">{event.date}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <button
                          className="w-full mt-4 py-2 text-xs text-accent-blue hover:text-accent-blue/80 transition-colors"
                          onClick={() => {
                            setShowCalendar(false)
                            // Navegar para página de calendário
                          }}
                        >
                          Ver calendário completo
                        </button>
                      </div>
                      
                      {calendarEvents.length === 0 && (
                        <div className="p-8 text-center">
                          <span className="material-symbols-outlined text-4xl text-text-tertiary mb-2">
                            event_available
                          </span>
                          <p className="text-sm text-text-secondary">Nenhum evento próximo</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Notificações */}
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowNotifications(!showNotifications)
                      setShowUserMenu(false)
                    }}
                    className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-tertiary rounded-lg transition-colors relative"
                    title="Notificações"
                  >
                    <span className="material-symbols-outlined">notifications</span>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown de Notificações */}
                  {showNotifications && (
                    <div 
                      className="absolute right-0 mt-2 w-80 bg-background-primary border border-border rounded-lg shadow-xl z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-text-primary">Notificações</h3>
                          <button
                            onClick={() => {
                              router.push('/notifications')
                              setShowNotifications(false)
                            }}
                            className="text-xs text-accent-blue hover:text-accent-blue/80"
                          >
                            Ver todas
                          </button>
                        </div>
                      </div>
                      
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b border-border hover:bg-background-secondary transition-colors cursor-pointer ${
                              !notification.read ? 'bg-accent-blue/5' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`w-8 h-8 rounded-full bg-background-tertiary flex items-center justify-center flex-shrink-0`}>
                                <span className={`material-symbols-outlined text-[16px] ${getNotificationColor(notification.type)}`}>
                                  {getNotificationIcon(notification.type)}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-text-tertiary mt-1">
                                  {notification.time}
                                </p>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-accent-blue flex-shrink-0 mt-2"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {notifications.length === 0 && (
                        <div className="p-8 text-center">
                          <span className="material-symbols-outlined text-4xl text-text-tertiary mb-2">
                            notifications_off
                          </span>
                          <p className="text-sm text-text-secondary">Nenhuma notificação</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Avatar e Menu do Usuário */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowUserMenu(!showUserMenu)
                      setShowNotifications(false)
                    }}
                    className="flex items-center space-x-2 hover:bg-background-tertiary rounded-lg p-2 transition-colors"
                  >
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-medium text-text-primary truncate max-w-32">
                        {user?.name || 'Usuário'}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {user?.role || 'Estudante'}
                      </p>
                    </div>
                    
                    <div className="w-8 h-8 bg-accent-blue rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown do Usuário */}
                  {showUserMenu && (
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-background-primary border border-border rounded-lg shadow-xl z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            // Navegar para perfil
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-background-tertiary rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <span className="material-symbols-outlined text-sm">person</span>
                          <span>Meu Perfil</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            // Navegar para configurações
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-background-tertiary rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <span className="material-symbols-outlined text-sm">settings</span>
                          <span>Configurações</span>
                        </button>
                        
                        <hr className="my-2 border-border" />
                        
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            logout()
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors flex items-center space-x-2"
                        >
                          <span className="material-symbols-outlined text-sm">logout</span>
                          <span>Sair</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Sem Right Sidebar */}
        <main className="flex-1 overflow-y-auto bg-background-tertiary min-w-0">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

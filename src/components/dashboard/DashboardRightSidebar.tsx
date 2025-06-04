'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'

interface ActivityItem {
  id: string
  type: 'assignment' | 'grade' | 'message' | 'announcement'
  title: string
  description: string
  time: string
  priority: 'high' | 'medium' | 'low'
}

interface NotificationItem {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: 'info' | 'warning' | 'success' | 'error'
}

type TabType = 'activities' | 'notifications' | 'calendar'

const SIDEBAR_WIDTH = '20rem' // 320px
const COLLAPSED_WIDTH = '4rem' // 64px

export default function DashboardRightSidebar() {
  const { user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(true) // Inicia compacta
  const [activeTab, setActiveTab] = useState<TabType>('activities')

  // Mock data - em produção, isso viria de APIs
  const [activities] = useState<ActivityItem[]>([
    {
      id: '1',
      type: 'assignment',
      title: 'Matemática - Lista 3',
      description: 'Entrega até 15/06',
      time: '2h',
      priority: 'high'
    },
    {
      id: '2',
      type: 'grade',
      title: 'Nota Publicada',
      description: 'História - Prova Bimestral',
      time: '4h',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'message',
      title: 'Nova Mensagem',
      description: 'Prof. Silva enviou uma mensagem',
      time: '1d',
      priority: 'low'
    }
  ])

  const [notifications] = useState<NotificationItem[]>([
    {
      id: '1',
      title: 'Reunião de Pais',
      message: 'Agendada para 20/06 às 19h',
      time: '30min',
      read: false,
      type: 'info'
    },
    {
      id: '2',
      title: 'Pagamento Pendente',
      message: 'Mensalidade de Junho',
      time: '2h',
      read: false,
      type: 'warning'
    },
    {
      id: '3',
      title: 'Certificado Disponível',
      message: 'Curso de Inglês concluído',
      time: '1d',
      read: true,
      type: 'success'
    }
  ])

  const getActivityIcon = (type: ActivityItem['type']) => {
    const icons = {
      assignment: 'assignment',
      grade: 'grade',
      message: 'mail',
      announcement: 'campaign'
    }
    return icons[type]
  }

  const getActivityColor = (priority: ActivityItem['priority']) => {
    const colors = {
      high: 'text-error',
      medium: 'text-warning',
      low: 'text-accent-blue'
    }
    return colors[priority]
  }

  const getNotificationIcon = (type: NotificationItem['type']) => {
    const icons = {
      info: 'info',
      warning: 'warning',
      success: 'check_circle',
      error: 'error'
    }
    return icons[type]
  }

  const getNotificationColor = (type: NotificationItem['type']) => {
    const colors = {
      info: 'text-accent-blue',
      warning: 'text-warning',
      success: 'text-success',
      error: 'text-error'
    }
    return colors[type]
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div
      className={`transition-all duration-300 ease-in-out bg-background-secondary border-l border-border shadow-xl h-full flex-shrink-0 ${
        isCollapsed ? 'overflow-hidden' : 'overflow-y-auto'
      }`}
      style={{ width: isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border bg-background-primary">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-text-primary">Atividades</h2>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-background-tertiary transition-colors"
            aria-label={isCollapsed ? "Expandir painel" : "Recolher painel"}
          >
            <span className="material-symbols-outlined text-text-secondary">
              {isCollapsed ? 'chevron_left' : 'chevron_right'}
            </span>
          </button>
        </div>

        {/* Tabs */}
        {!isCollapsed && (
          <div className="flex mt-4 bg-background-tertiary rounded-lg p-1">
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'activities'
                  ? 'bg-background-primary text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Atividades
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-background-primary text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Avisos
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-background-primary text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Agenda
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex-1 ${isCollapsed ? 'overflow-hidden' : 'overflow-y-auto'} ${isCollapsed ? 'p-2' : 'p-4'}`}>
        {isCollapsed ? (
          // Collapsed view - ícones interativos com tooltips
          <div className="h-full flex flex-col">
            <div className="flex flex-col items-center justify-center space-y-4 flex-1">
              <button
                onClick={() => setActiveTab('activities')}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all relative group ${
                  activeTab === 'activities' ? 'bg-accent-blue text-white shadow-md' : 'bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30'
                }`}
                title="Atividades"
              >
                <span className="material-symbols-outlined text-[16px]">
                  assignment
                </span>
                <div className="absolute right-full mr-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Atividades ({activities.length})
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all relative group ${
                  activeTab === 'notifications' ? 'bg-warning text-white shadow-md' : 'bg-warning/20 text-warning hover:bg-warning/30'
                }`}
                title="Avisos"
              >
                <span className="material-symbols-outlined text-[16px]">
                  notifications
                </span>
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-white text-xs rounded-full flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
                <div className="absolute right-full mr-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Avisos ({notifications.filter(n => !n.read).length} não lidos)
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('calendar')}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all relative group ${
                  activeTab === 'calendar' ? 'bg-success text-white shadow-md' : 'bg-success/20 text-success hover:bg-success/30'
                }`}
                title="Agenda"
              >
                <span className="material-symbols-outlined text-[16px]">
                  calendar_month
                </span>
                <div className="absolute right-full mr-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Agenda (3 eventos)
                </div>
              </button>
            </div>
            
            {/* Indicador de conteúdo ativo quando colapsado */}
            <div className="mt-auto mb-4">
              <div className="w-full h-px bg-border mb-3"></div>
              <div className="text-center">
                <div className="text-xs text-text-tertiary">
                  {activeTab === 'activities' && (
                    <div className="space-y-1">
                      <div className="text-accent-blue font-medium">{activities.length}</div>
                      <div>atividades</div>
                    </div>
                  )}
                  {activeTab === 'notifications' && (
                    <div className="space-y-1">
                      <div className="text-warning font-medium">{notifications.filter(n => !n.read).length}</div>
                      <div>não lidos</div>
                    </div>
                  )}
                  {activeTab === 'calendar' && (
                    <div className="space-y-1">
                      <div className="text-success font-medium">3</div>
                      <div>eventos</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Expanded view
          <>
            {/* Activities Tab */}
            {activeTab === 'activities' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-text-primary">Recentes</h3>
                  <span className="text-xs text-text-secondary">{activities.length} itens</span>
                </div>
                
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="p-3 rounded-lg bg-background-primary border border-border hover:shadow-sm transition-shadow cursor-pointer"
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

                <button className="w-full py-2 text-xs text-accent-blue hover:text-accent-blue/80 transition-colors">
                  Ver todas as atividades
                </button>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-text-primary">Avisos</h3>
                  <span className="text-xs text-text-secondary">
                    {notifications.filter(n => !n.read).length} não lidos
                  </span>
                </div>
                
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      notification.read
                        ? 'bg-background-primary border-border'
                        : 'bg-accent-blue/5 border-accent-blue/20'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-background-tertiary flex items-center justify-center flex-shrink-0">
                        <span className={`material-symbols-outlined text-[16px] ${getNotificationColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-text-tertiary mt-1">
                          há {notification.time}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-accent-blue flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </div>
                ))}

                <button className="w-full py-2 text-xs text-accent-blue hover:text-accent-blue/80 transition-colors">
                  Ver todos os avisos
                </button>
              </div>
            )}

            {/* Calendar Tab */}
            {activeTab === 'calendar' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-text-primary">Próximos Eventos</h3>
                </div>

                {/* Mini Calendar */}
                <div className="bg-background-primary rounded-lg border border-border p-3">
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
                    <div className="p-2 rounded-lg bg-background-primary border border-border">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-accent-blue"></div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-text-primary">Prova de Matemática</p>
                          <p className="text-xs text-text-secondary">15 Jun, 14:00</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2 rounded-lg bg-background-primary border border-border">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-warning"></div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-text-primary">Reunião de Pais</p>
                          <p className="text-xs text-text-secondary">20 Jun, 19:00</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2 rounded-lg bg-background-primary border border-border">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-success"></div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-text-primary">Entrega de Projeto</p>
                          <p className="text-xs text-text-secondary">25 Jun, 23:59</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full py-2 text-xs text-accent-blue hover:text-accent-blue/80 transition-colors">
                  Ver calendário completo
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
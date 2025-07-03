'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import SafeDashboardSidebar from '@/components/SafeDashboardSidebar'
import { useTheme } from '@/contexts/ThemeContext'
import { motion, AnimatePresence } from 'framer-motion'
import { UpdateNotificationCompact } from '@/components/UpdateNotificationCompact'
import { useUpdateStatus } from '@/components/PWAUpdateManager'
import { EnhancedLoadingState } from '@/components/ui/LoadingStates'
interface DashboardLayoutProps {
  children: React.ReactNode
}

export enum UserRole {
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  INSTITUTION_MANAGER = 'INSTITUTION_MANAGER', 
  COORDINATOR = 'COORDINATOR',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  GUARDIAN = 'GUARDIAN'
}


export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.SYSTEM_ADMIN]: 'Administrador do Sistema',
  [UserRole.INSTITUTION_MANAGER]: 'Gestor de Instituição',
  [UserRole.ACADEMIC_COORDINATOR]: 'Coordenador Acadêmico',
  [UserRole.TEACHER]: 'Professor',
  [UserRole.STUDENT]: 'Estudante',
  [UserRole.GUARDIAN]: 'Responsável'
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showActivities, setShowActivities] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const { theme, themeType, toggleTheme } = useTheme()
  
  // Hook para status de atualização (com fallback para quando não estiver no UpdateProvider)
  let updateStatus = null
  try {
    updateStatus = useUpdateStatus()
  } catch (error) {
    // Se não estiver dentro do UpdateProvider, usar valores padrão
    updateStatus = {
      isUpdateAvailable: false,
      isUpdating: false,
      handleUpdate: () => {}
    }
  }

  // Verificação de segurança para o tema
  if (!theme || !theme.colors) {
    return (
      <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
        <div className="w-64 bg-gray-100 border-r border-gray-200 p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 rounded mb-4"></div>
            <div className="h-4 bg-gray-300 rounded mb-2"></div>
            <div className="h-4 bg-gray-300 rounded mb-2 w-3/4"></div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando tema...</p>
          </div>
        </div>
      </div>
    );
  }

  
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

  // Adicionar listener para cliques fora dos dropdowns
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Verificar se o clique foi em um dropdown ou seus elementos
      const isDropdownClick = target.closest('[data-dropdown]') || 
                             target.closest('[data-dropdown-trigger]');
      
      if (!isDropdownClick) {
        handleClickOutside();
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [])

  // Função de logout melhorada para seguir o padrão dos outros componentes
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      setShowUserMenu(false);
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      {/* Loading State para Logout */}
      {isLoggingOut && (
        <EnhancedLoadingState
          message="Saindo do sistema..."
          submessage="Limpando dados e finalizando sessão"
          showProgress={false}
        />
      )}

      <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: theme.colors.background.secondary }}>
      {/* Left Sidebar - Ajustado para ser responsivo */}
      <div className="hidden md:block">
        <SafeDashboardSidebar />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full">
        {/* Header - Ajustado para mobile */}
        <header className="shadow-sm border-b flex-shrink-0" style={{ 
          backgroundColor: theme.colors.background.primary,
          borderColor: theme.colors.border.DEFAULT 
        }}>
          <div className="px-3 sm:px-6 lg:px-8 py-2 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold truncate" style={{ color: theme.colors.text.primary }}>
                  Portal Educacional Sabercon
                </h1>
                <p className="text-xs sm:text-sm truncate" style={{ color: theme.colors.text.secondary }}>
                  Bem-vindo(a), {user?.name}
                </p>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 flex-shrink-0">
                {/* Menu Mobile */}
                <button
                  className="md:hidden p-2 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(true)}
                  style={{ color: theme.colors.text.secondary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.background.tertiary
                    e.currentTarget.style.color = theme.colors.text.primary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = theme.colors.text.secondary
                  }}
                >
                  <span className="material-symbols-outlined">menu</span>
                </button>

                {/* Notificações */}
                <div className="relative">
                  <button
                    data-dropdown-trigger
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowNotifications(!showNotifications)
                      setShowActivities(false)
                      setShowCalendar(false)
                      setShowUserMenu(false)
                    }}
                    className="p-2 rounded-lg transition-all duration-200 relative"
                    style={{ 
                      color: theme.colors.text.secondary,
                      backgroundColor: showNotifications ? theme.colors.background.tertiary : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!showNotifications) {
                        e.currentTarget.style.backgroundColor = theme.colors.background.tertiary
                        e.currentTarget.style.color = theme.colors.text.primary
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!showNotifications) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = theme.colors.text.secondary
                      }
                    }}
                    title="Notificações"
                  >
                    <span className="material-symbols-outlined">notifications</span>
                    {unreadCount > 0 && (
                      <span 
                        className="absolute top-1 right-1 w-2 h-2 rounded-full"
                        style={{ backgroundColor: theme.colors.status.error }}
                      />
                    )}
                  </button>

                  {/* Dropdown de Notificações */}
                  {showNotifications && (
                    <motion.div
                      data-dropdown
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden"
                      style={{
                        backgroundColor: theme.colors.background.primary,
                        border: `1px solid ${theme.colors.border.DEFAULT}`
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-4 border-b" style={{ borderColor: theme.colors.border.DEFAULT }}>
                        <h3 className="font-semibold" style={{ color: theme.colors.text.primary }}>
                          Notificações
                        </h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 border-b transition-colors cursor-pointer ${
                              !notification.read ? 'bg-opacity-5' : ''
                            }`}
                            style={{
                              borderColor: theme.colors.border.light,
                              backgroundColor: !notification.read ? theme.colors.primary.DEFAULT + '10' : 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = theme.colors.background.tertiary
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = !notification.read ? theme.colors.primary.DEFAULT + '10' : 'transparent'
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <span 
                                className={`material-symbols-outlined text-lg ${getNotificationColor(notification.type)}`}
                              >
                                {getNotificationIcon(notification.type)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm" style={{ color: theme.colors.text.primary }}>
                                  {notification.title}
                                </p>
                                <p className="text-xs mt-1" style={{ color: theme.colors.text.secondary }}>
                                  {notification.message}
                                </p>
                                <p className="text-xs mt-2" style={{ color: theme.colors.text.tertiary }}>
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t" style={{ borderColor: theme.colors.border.DEFAULT }}>
                        <button
                          className="text-sm font-medium w-full py-2 rounded-lg transition-colors"
                          style={{ 
                            color: theme.colors.primary.DEFAULT,
                            backgroundColor: theme.colors.primary.DEFAULT + '10'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.colors.primary.DEFAULT + '20'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = theme.colors.primary.DEFAULT + '10'
                          }}
                        >
                          Ver todas as notificações
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Atividades */}
                <div className="relative">
                  <button
                    data-dropdown-trigger
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowActivities(!showActivities)
                      setShowNotifications(false)
                      setShowCalendar(false)
                      setShowUserMenu(false)
                    }}
                    className="p-2 rounded-lg transition-all duration-200"
                    style={{ 
                      color: theme.colors.text.secondary,
                      backgroundColor: showActivities ? theme.colors.background.tertiary : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!showActivities) {
                        e.currentTarget.style.backgroundColor = theme.colors.background.tertiary
                        e.currentTarget.style.color = theme.colors.text.primary
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!showActivities) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = theme.colors.text.secondary
                      }
                    }}
                    title="Atividades"
                  >
                    <span className="material-symbols-outlined">assignment</span>
                  </button>

                  {/* Dropdown de Atividades */}
                  {showActivities && (
                    <motion.div
                      data-dropdown
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden"
                      style={{
                        backgroundColor: theme.colors.background.primary,
                        border: `1px solid ${theme.colors.border.DEFAULT}`
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-4 border-b" style={{ borderColor: theme.colors.border.DEFAULT }}>
                        <h3 className="font-semibold" style={{ color: theme.colors.text.primary }}>
                          Atividades Pendentes
                        </h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {activities.map((activity) => (
                          <div
                            key={activity.id}
                            className="p-4 border-b transition-colors cursor-pointer"
                            style={{ borderColor: theme.colors.border.light }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = theme.colors.background.tertiary
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <span 
                                className={`material-symbols-outlined text-lg ${getActivityColor(activity.priority)}`}
                              >
                                {getActivityIcon(activity.type)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm" style={{ color: theme.colors.text.primary }}>
                                  {activity.title}
                                </p>
                                <p className="text-xs mt-1" style={{ color: theme.colors.text.secondary }}>
                                  {activity.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs" style={{ color: theme.colors.text.tertiary }}>
                                    {activity.time}
                                  </span>
                                  <span 
                                    className="text-xs px-2 py-0.5 rounded-full"
                                    style={{ 
                                      backgroundColor: activity.priority === 'high' 
                                        ? theme.colors.status.error + '20'
                                        : activity.priority === 'medium'
                                        ? theme.colors.status.warning + '20'
                                        : theme.colors.status.info + '20',
                                      color: activity.priority === 'high' 
                                        ? theme.colors.status.error
                                        : activity.priority === 'medium'
                                        ? theme.colors.status.warning
                                        : theme.colors.status.info
                                    }}
                                  >
                                    {activity.priority === 'high' ? 'Alta' : activity.priority === 'medium' ? 'Média' : 'Baixa'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t" style={{ borderColor: theme.colors.border.DEFAULT }}>
                        <button
                          className="text-sm font-medium w-full py-2 rounded-lg transition-colors"
                          style={{ 
                            color: theme.colors.primary.DEFAULT,
                            backgroundColor: theme.colors.primary.DEFAULT + '10'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.colors.primary.DEFAULT + '20'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = theme.colors.primary.DEFAULT + '10'
                          }}
                        >
                          Ver todas as atividades
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Calendário */}
                <div className="relative">
                  <button
                    data-dropdown-trigger
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowCalendar(!showCalendar)
                      setShowNotifications(false)
                      setShowActivities(false)
                      setShowUserMenu(false)
                    }}
                    className="p-2 rounded-lg transition-all duration-200"
                    style={{ 
                      color: theme.colors.text.secondary,
                      backgroundColor: showCalendar ? theme.colors.background.tertiary : 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      if (!showCalendar) {
                        e.currentTarget.style.backgroundColor = theme.colors.background.tertiary
                        e.currentTarget.style.color = theme.colors.text.primary
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!showCalendar) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = theme.colors.text.secondary
                      }
                    }}
                    title="Calendário"
                  >
                    <span className="material-symbols-outlined">calendar_today</span>
                  </button>

                  {/* Dropdown do Calendário */}
                  {showCalendar && (
                    <motion.div
                      data-dropdown
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 rounded-lg shadow-xl z-50"
                      style={{
                        backgroundColor: theme.colors.background.primary,
                        border: `1px solid ${theme.colors.border.DEFAULT}`
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-4 border-b" style={{ borderColor: theme.colors.border.DEFAULT }}>
                        <h3 className="font-semibold" style={{ color: theme.colors.text.primary }}>
                          Próximos Eventos
                        </h3>
                      </div>
                      <div className="p-4 space-y-3">
                        {calendarEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center gap-3 p-3 rounded-lg transition-colors cursor-pointer"
                            style={{ backgroundColor: theme.colors.background.tertiary }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = theme.colors.background.secondary
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = theme.colors.background.tertiary
                            }}
                          >
                            <div className={`w-3 h-3 rounded-full ${event.color}`} />
                            <div className="flex-1">
                              <p className="text-sm font-medium" style={{ color: theme.colors.text.primary }}>
                                {event.title}
                              </p>
                              <p className="text-xs" style={{ color: theme.colors.text.secondary }}>
                                {event.date}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-3 border-t" style={{ borderColor: theme.colors.border.DEFAULT }}>
                        <button
                          className="text-sm font-medium w-full py-2 rounded-lg transition-colors"
                          style={{ 
                            color: theme.colors.primary.DEFAULT,
                            backgroundColor: theme.colors.primary.DEFAULT + '10'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.colors.primary.DEFAULT + '20'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = theme.colors.primary.DEFAULT + '10'
                          }}
                        >
                          Ver calendário completo
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Dark/Light Mode Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg transition-all duration-200"
                  style={{ 
                    color: theme.colors.text.secondary,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.background.tertiary
                    e.currentTarget.style.color = theme.colors.text.primary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = theme.colors.text.secondary
                  }}
                  title={themeType === 'modern' ? 'Modo Claro' : themeType === 'corporate' ? 'Modo Moderno' : 'Modo Corporativo'}
                >
                  <span className="material-symbols-outlined">
                    {themeType === 'modern' ? 'light_mode' : themeType === 'corporate' ? 'contrast' : 'dark_mode'}
                  </span>
                </button>

                {/* Update Notification Compact */}
                <UpdateNotificationCompact
                  isUpdateAvailable={updateStatus.isUpdateAvailable}
                  onUpdate={updateStatus.handleUpdate}
                  isUpdating={updateStatus.isUpdating}
                />
                
                {/* Avatar e Menu do Usuário - Ajustado para mobile */}
                <div className="relative">
                  <button
                    data-dropdown-trigger
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowUserMenu(!showUserMenu)
                      setShowNotifications(false)
                    }}
                    className="flex items-center gap-2 rounded-lg p-1 sm:p-2 transition-colors"
                    style={{
                      backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.background.tertiary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <div className="hidden sm:block text-right">
                      <p className="text-sm font-medium truncate max-w-24 lg:max-w-32" style={{ color: theme.colors.text.primary }}>
                      {user?.role && ROLE_LABELS[user.role as UserRole]}
                      </p>
                      <p className="text-xs" style={{ color: theme.colors.text.secondary }}>
                      {user?.role && ROLE_LABELS[user.role as UserRole]}
                      </p>
                    </div>
                    
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ 
                      backgroundColor: theme.colors.primary.DEFAULT,
                      color: theme.colors.primary.contrast
                    }}>
                      <span className="text-sm font-medium">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </button>

                  {/* Dropdown do Usuário */}
                  {showUserMenu && (
                    <div 
                      data-dropdown
                      className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl z-50"
                      style={{
                        backgroundColor: theme.colors.background.primary,
                        border: `1px solid ${theme.colors.border.DEFAULT}`
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-2">
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            // Navegar para perfil
                          }}
                          className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center space-x-2"
                          style={{ color: theme.colors.text.primary }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.colors.background.tertiary
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <span className="material-symbols-outlined text-sm">person</span>
                          <span>Meu Perfil</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            // Navegar para configurações
                          }}
                          className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center space-x-2"
                          style={{ color: theme.colors.text.primary }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.colors.background.tertiary
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <span className="material-symbols-outlined text-sm">settings</span>
                          <span>Configurações</span>
                        </button>
                        
                        <hr className="my-2" style={{ borderColor: theme.colors.border.DEFAULT }} />
                        
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors flex items-center space-x-2"
                          style={{ color: theme.colors.status.error }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.colors.status.error + '10'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                        >
                          <span className="material-symbols-outlined text-sm">logout</span>
                          <span>Sair da Plataforma</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content - Ajustado para mobile */}
        <main className="flex-1 overflow-y-auto min-w-0 px-3 sm:px-6 lg:px-8 py-4 sm:py-6" style={{ backgroundColor: theme.colors.background.tertiary }}>
          <div className="h-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-y-0 left-0 w-64 shadow-xl" style={{ backgroundColor: theme.colors.background.primary }} onClick={(e) => e.stopPropagation()}>
            <SafeDashboardSidebar />
          </div>
        </div>
      )}
    </div>
    </>
  )
}

'use client'

import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROLE_LABELS, UserRole } from '@/types/roles'
import { EnhancedLoadingState } from '../ui/LoadingStates'

interface Notification {
  id: number
  type: 'info' | 'warning' | 'success'
  message: string
  time: string
  read: boolean
}

export default function DashboardHeader() {
  const { user, logout } = useAuth()
  const { theme } = useTheme()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  // Mock notifications data
  const notifications: Notification[] = [
    {
      id: 1,
      type: 'info',
      message: 'Nova atividade enviada em Matemática',
      time: 'há 5 minutos',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      message: 'Prazo próximo: Relatório de Física',
      time: 'há 1 hora',
      read: false
    },
    {
      id: 3,
      type: 'success',
      message: 'Notas da última avaliação disponíveis',
      time: 'há 2 horas',
      read: true
    }
  ]

  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return 'info'
      case 'warning':
        return 'warning'
      case 'success':
        return 'check_circle'
      default:
        return 'notifications'
    }
  }

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return theme.colors.status.info
      case 'warning':
        return theme.colors.status.warning
      case 'success':
        return theme.colors.status.success
      default:
        return theme.colors.text.secondary
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

      <header 
        className="border-b h-16 flex-shrink-0"
        style={{ 
          backgroundColor: theme.colors.background.primary,
          borderColor: theme.colors.border.DEFAULT 
        }}
      >
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side - Title */}
        <h1 
          className="text-lg font-semibold"
          style={{ color: theme.colors.text.primary }}
        >
          Portal Educacional Sabercon
        </h1>
        
        {/* Right side - Notifications and Profile */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              className="p-2 hover:bg-opacity-10 rounded-full relative transition-colors"
              style={{ 
                color: theme.colors.text.secondary,
                backgroundColor: showNotifications ? theme.colors.background.tertiary : 'transparent'
              }}
              onClick={() => setShowNotifications(!showNotifications)}
              onMouseEnter={(e) => {
                if (!showNotifications) {
                  e.currentTarget.style.backgroundColor = theme.colors.background.tertiary
                }
              }}
              onMouseLeave={(e) => {
                if (!showNotifications) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              {unreadCount > 0 && (
                <div 
                  className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: theme.colors.status.error }}
                >
                  <span className="text-xs text-white font-medium">{unreadCount}</span>
                </div>
              )}
              <span className="material-symbols-outlined">
                notifications
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div 
                className="absolute right-0 mt-2 w-80 rounded-lg shadow-lg border z-50"
                style={{
                  backgroundColor: theme.colors.background.primary,
                  borderColor: theme.colors.border.DEFAULT
                }}
              >
                <div 
                  className="p-4 border-b"
                  style={{ borderColor: theme.colors.border.DEFAULT }}
                >
                  <div className="flex items-center justify-between">
                    <h3 
                      className="text-sm font-semibold"
                      style={{ color: theme.colors.text.primary }}
                    >
                      Central de Notificações
                    </h3>
                    <span 
                      className="text-xs"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      {unreadCount} não lidas
                    </span>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y" style={{ borderColor: theme.colors.border.light }}>
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 hover:bg-opacity-5 transition-colors ${
                            !notification.read ? 'bg-opacity-5' : ''
                          }`}
                          style={{
                            backgroundColor: !notification.read ? theme.colors.primary.DEFAULT + '10' : 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.colors.background.tertiary
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = !notification.read ? theme.colors.primary.DEFAULT + '10' : 'transparent'
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <span 
                              className="material-symbols-outlined"
                              style={{ color: getNotificationColor(notification.type) }}
                            >
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p 
                                className="text-sm"
                                style={{ color: theme.colors.text.primary }}
                              >
                                {notification.message}
                              </p>
                              <p 
                                className="text-xs mt-1"
                                style={{ color: theme.colors.text.secondary }}
                              >
                                {notification.time}
                              </p>
                            </div>
                            {!notification.read && (
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: theme.colors.primary.DEFAULT }}
                              ></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center">
                      <span 
                        className="material-symbols-outlined text-4xl mb-2"
                        style={{ color: theme.colors.text.secondary }}
                      >
                        notifications_off
                      </span>
                      <p 
                        className="text-sm"
                        style={{ color: theme.colors.text.secondary }}
                      >
                        Você não tem notificações
                      </p>
                    </div>
                  )}
                </div>

                <div 
                  className="p-4 border-t"
                  style={{ borderColor: theme.colors.border.DEFAULT }}
                >
                  <button
                    onClick={() => {
                      router.push('/notifications')
                      setShowNotifications(false)
                    }}
                    className="w-full text-center text-sm font-medium py-2 rounded-lg transition-colors"
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
                    Visualizar todas as notificações
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="flex items-center space-x-3 relative">
            <button 
              className="flex items-center space-x-3 focus:outline-none"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu)
                if (showNotifications) setShowNotifications(false)
              }}
            >
              {/* Profile Image */}
              <div className="relative">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: theme.colors.primary.DEFAULT }}
                >
                  <div className="relative w-6 h-6">
                    <Image 
                      src="/sabercon-logo-white.png"
                      alt="Profile"
                      fill
                      sizes="(max-width: 768px) 24px, 32px"
                      className="object-contain"
                    />
                  </div>
                </div>
                <div 
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                  style={{ 
                    backgroundColor: theme.colors.status.success,
                    borderColor: theme.colors.background.primary
                  }}
                ></div>
              </div>
              
              {/* Profile Info */}
              <div className="flex items-center">
                <div className="flex flex-col">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: theme.colors.text.primary }}
                  >
                    {user?.name || 'Administrator'}
                  </span>
                  <span 
                    className="text-xs"
                    style={{ color: theme.colors.text.secondary }}
                  >
                  {user?.role && ROLE_LABELS[user.role as UserRole]}
              </span>
                </div>
                <span 
                  className="material-symbols-outlined ml-2"
                  style={{ color: theme.colors.text.secondary }}
                >
                  expand_more
                </span>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div 
                className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border z-50"
                style={{
                  backgroundColor: theme.colors.background.primary,
                  borderColor: theme.colors.border.DEFAULT
                }}
              >
                <div className="py-1">
                  <button
                    onClick={() => {
                      router.push('/profile')
                      setShowProfileMenu(false)
                    }}
                    className="w-full px-4 py-2 text-sm hover:bg-opacity-10 flex items-center transition-colors"
                    style={{ color: theme.colors.text.primary }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.background.tertiary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <span 
                      className="material-symbols-outlined mr-2"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      person
                    </span>
                    Perfil
                  </button>
                  <button
                    onClick={() => {
                      router.push('/change-password')
                      setShowProfileMenu(false)
                    }}
                    className="w-full px-4 py-2 text-sm hover:bg-opacity-10 flex items-center transition-colors"
                    style={{ color: theme.colors.text.primary }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.background.tertiary
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <span 
                      className="material-symbols-outlined mr-2"
                      style={{ color: theme.colors.text.secondary }}
                    >
                      lock
                    </span>
                    Alterar Senha
                  </button>
                  <button
                    onClick={async () => {
                      setIsLoggingOut(true);
                      setShowProfileMenu(false);
                      try {
                        await logout();
                      } catch (error) {
                        console.log('Erro ao fazer logout:', error);
                      } finally {
                        setIsLoggingOut(false);
                      }
                    }}
                    className="w-full px-4 py-2 text-sm hover:bg-opacity-10 flex items-center transition-colors"
                    style={{ color: theme.colors.status.error }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.status.error + '10'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    <span 
                      className="material-symbols-outlined mr-2"
                      style={{ color: theme.colors.status.error }}
                    >
                      logout
                    </span>
                    Sair da Plataforma
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
    </>
  )
}

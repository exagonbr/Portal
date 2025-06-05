'use client'

import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { teacherMockData } from '@/constants/mockData'
import { ROLE_LABELS, UserRole } from '@/types/roles'

interface Notification {
  id: number
  type: 'info' | 'warning' | 'success'
  message: string
  time: string
  read: boolean
}

export default function DashboardHeader() {
  const { user, logout } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
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
        return 'text-blue-600 bg-blue-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'success':
        return 'text-green-600 bg-green-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <header className="bg-white border-b border-gray-100 h-13">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side - Title */}
        <h1 className=" font-semibold text-gray-700">
          Portal Educacional Sabercon
        </h1>
        
        {/* Right side - Notifications and Profile */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              className="p-2 hover:bg-gray-50 rounded-full relative transition-colors"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              {unreadCount > 0 && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">{unreadCount}</span>
                </div>
              )}
              <span className="material-symbols-outlined text-gray-600">
                notifications
              </span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Central de Notificações</h3>
                    <span className="text-xs text-gray-500">{notifications.length} não lidas</span>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 hover:bg-gray-50 transition-colors ${
                            !notification.read ? 'bg-blue-50/50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <span className={`material-symbols-outlined ${getNotificationColor(notification.type)}`}>
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                      <p className="text-sm">Você não tem notificações</p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      router.push('/notifications')
                      setShowNotifications(false)
                    }}
                    className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
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
                <div className="w-10 h-10 rounded-full bg-[#1a2b6d] flex items-center justify-center overflow-hidden">
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
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              
              {/* Profile Info */}
              <div className="flex items-center">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name || 'Administrator'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {user?.role && ROLE_LABELS[user.role.toUpperCase() as keyof typeof ROLE_LABELS] || 'Usuário'}
                  </span>
                </div>
                <span className="material-symbols-outlined text-gray-400 ml-2">
                  expand_more
                </span>
              </div>
            </button>

            {/* Profile Dropdown Menu */}
            {showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
                <div className="py-1">
                  <button
                    onClick={() => {
                      router.push('/profile')
                      setShowProfileMenu(false)
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <span className="material-symbols-outlined mr-2 text-gray-400">
                      person
                    </span>
                    Perfil
                  </button>
                  <button
                    onClick={() => {
                      router.push('/change-password')
                      setShowProfileMenu(false)
                    }}
                    className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <span className="material-symbols-outlined mr-2 text-gray-400">
                      lock
                    </span>
                    Alterar Senha
                  </button>
                  <button
                    onClick={() => {
                      logout()
                      setShowProfileMenu(false)
                    }}
                    className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center"
                  >
                    <span className="material-symbols-outlined mr-2 text-red-600">
                      logout
                    </span>
                    Sair
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

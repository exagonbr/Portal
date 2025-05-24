'use client'

import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'
import { teacherMockData } from '@/constants/dashboardData'

interface Notification {
  id: number
  type: 'info' | 'warning' | 'success'
  message: string
  time: string
  read: boolean
}

export default function DashboardHeader() {
  const { user } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)

  // Mock notifications data
  const notifications: Notification[] = [
    {
      id: 1,
      type: 'info',
      message: 'Nova atividade entregue em Matemática',
      time: '5 min atrás',
      read: false
    },
    {
      id: 2,
      type: 'warning',
      message: 'Prazo de entrega próximo: Relatório de Física',
      time: '1 hora atrás',
      read: false
    },
    {
      id: 3,
      type: 'success',
      message: 'Notas do último teste publicadas',
      time: '2 horas atrás',
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
    <header className="bg-white border-b border-gray-100 h-16">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side - Title */}
        <h1 className=" font-semibold text-gray-900">
          Bem vindo, {user?.name}
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
                    <h3 className="text-sm font-semibold text-gray-900">Notificações</h3>
                    <span className="text-xs text-gray-500">{notifications.length} novas</span>
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
                              <p className="text-sm text-gray-900">{notification.message}</p>
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
                      <p className="text-sm">Nenhuma notificação</p>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-100">
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Ver todas as notificações
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Section */}
          <div className="flex items-center space-x-3">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#1a2b6d] flex items-center justify-center overflow-hidden">
                <div className="relative w-6 h-6">
                  <Image 
                    src="/sabercon-logo-white.png"
                    alt="Profile"
                    fill
                    sizes="24px"
                    className="object-contain"
                  />
                </div>
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            
            {/* Profile Info */}
            <div className="flex items-center">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {user?.name || 'Administrator'}
                </span>
                <span className="text-xs text-gray-500">
                  {user?.role === 'student' ? 'Estudante' : 'Professor'}
                </span>
              </div>
              <span className="material-symbols-outlined text-gray-400 ml-2">
                expand_more
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

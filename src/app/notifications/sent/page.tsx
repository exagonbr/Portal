'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/types/roles'
import { notificationService } from '@/services/notificationService'
import { Notification as SentNotification } from '@/types/notification'
import { PaginatedResponseDto } from '@/types/api'

export default function SentNotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'sent' | 'scheduled' | 'draft' | 'failed'>('all')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  // Verificar permissões - apenas GUARDIAN e STUDENT não podem acessar
  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    // Verificar se o usuário tem permissão para ver notificações enviadas
    const restrictedRoles = [UserRole.GUARDIAN, UserRole.STUDENT]
    if (restrictedRoles.includes(user.role as UserRole)) {
      router.push('/notifications')
      return
    }
  }, [user, router])

  // Carregar notificações enviadas
  useEffect(() => {
    const loadSentNotifications = async () => {
      try {
        setLoading(true)
        const response = await notificationService.getSentNotifications({
          status: filter === 'all' ? undefined : filter,
          page: pagination.page,
          limit: pagination.limit,
          sortBy: 'created_at',
          sortOrder: 'desc'
        })
        setSentNotifications(response.items)
        setPagination({
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
          hasNext: response.hasNext,
          hasPrev: response.hasPrev
        })
      } catch (error) {
        console.error('Erro ao carregar notificações enviadas:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && ![UserRole.GUARDIAN, UserRole.STUDENT].includes(user.role as UserRole)) {
      loadSentNotifications()
    }
  }, [user, filter, pagination.page, pagination.limit])

  // Reset page when filter changes
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [filter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-600'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Enviada'
      case 'scheduled':
        return 'Agendada'
      case 'draft':
        return 'Rascunho'
      case 'failed':
        return 'Falhou'
      default:
        return 'Desconhecido'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const filteredNotifications = sentNotifications.filter(notification => 
    filter === 'all' || notification.status === filter
  )

  // Verificar se o usuário pode acessar esta página
  if (!user || [UserRole.GUARDIAN, UserRole.STUDENT].includes(user.role as UserRole)) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl text-gray-400 mb-4">block</span>
          <h3 className="text-lg font-medium text-gray-700 mb-2">Acesso Negado</h3>
          <p className="text-gray-500 mb-4">Você não tem permissão para ver notificações enviadas.</p>
          <button
            onClick={() => router.push('/notifications')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Notificações
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando notificações enviadas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header da Página */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-gray-600">
                arrow_back
              </span>
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-700 dark:text-gray-800">Notificações Enviadas</h1>
              <p className="text-sm text-gray-500">
                Histórico de notificações que você enviou
              </p>
            </div>
          </div>
          
          <button
            onClick={() => router.push('/notifications/send')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span className="material-symbols-outlined text-sm">
              add
            </span>
            <span>Nova Notificação</span>
          </button>
        </div>
      </div>

      <div>
        {/* Filtros */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'sent', label: 'Enviadas' },
              { key: 'scheduled', label: 'Agendadas' },
              { key: 'draft', label: 'Rascunhos' },
              { key: 'failed', label: 'Falharam' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredNotifications.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <div key={notification.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-700">
                          {notification.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(notification.status)}`}>
                          {getStatusLabel(notification.status)}
                        </span>
                        <span className={`material-symbols-outlined text-sm ${getPriorityColor(notification.priority)}`}>
                          {notification.priority === 'high' ? 'priority_high' : 
                           notification.priority === 'medium' ? 'remove' : 'expand_more'}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <span className="material-symbols-outlined text-sm">
                            schedule
                          </span>
                          <span>
                            {notification.status === 'scheduled' && notification.scheduledFor
                              ? `Agendada para ${formatDate(notification.scheduledFor)}`
                              : notification.sentAt
                              ? `Enviada em ${formatDate(notification.sentAt)}`
                              : 'Rascunho'
                            }
                          </span>
                        </div>
                        
                        {notification.status === 'sent' && (
                          <div className="flex items-center space-x-1">
                            <span className="material-symbols-outlined text-sm">
                              group
                            </span>
                            <span>
                              {notification.recipients.total} destinatários
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-1">
                          <span className="material-symbols-outlined text-sm">
                            category
                          </span>
                          <span className="capitalize">
                            {notification.category}
                          </span>
                        </div>
                      </div>
                      
                      {notification.status === 'sent' && (
                        <div className="mt-3 flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1 text-green-600">
                            <span className="material-symbols-outlined text-sm">
                              mark_email_read
                            </span>
                            <span>{notification.recipients.read} lidas</span>
                          </div>
                          <div className="flex items-center space-x-1 text-orange-600">
                            <span className="material-symbols-outlined text-sm">
                              mark_email_unread
                            </span>
                            <span>{notification.recipients.unread} não lidas</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {notification.status === 'draft' && (
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                          <span className="material-symbols-outlined text-sm">
                            edit
                          </span>
                        </button>
                      )}
                      
                      {notification.status === 'scheduled' && (
                        <button className="p-2 text-orange-600 hover:bg-orange-50 rounded-full transition-colors">
                          <span className="material-symbols-outlined text-sm">
                            schedule
                          </span>
                        </button>
                      )}
                      
                      <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-sm">
                          more_vert
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-4">
                send
              </span>
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Nenhuma notificação encontrada
              </h3>
              <p className="text-gray-500 mb-4">
                Você ainda não enviou nenhuma notificação.
              </p>
              <button
                onClick={() => router.push('/notifications/send')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Enviar primeira notificação
              </button>
            </div>
          )}
        </div>

        {/* Paginação */}
        {filteredNotifications.length > 0 && (
          <div className="mt-4 flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
            <div className="flex items-center text-sm text-gray-500">
              <span>
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} resultados
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={!pagination.hasPrev}
                className={`px-3 py-1 rounded-lg text-sm ${
                  pagination.hasPrev
                    ? 'text-blue-600 hover:bg-blue-50'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                Anterior
              </button>
              
              <span className="px-3 py-1 text-sm text-gray-600">
                Página {pagination.page} de {pagination.totalPages}
              </span>
              
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={!pagination.hasNext}
                className={`px-3 py-1 rounded-lg text-sm ${
                  pagination.hasNext
                    ? 'text-blue-600 hover:bg-blue-50'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

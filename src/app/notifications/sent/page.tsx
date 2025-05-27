'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface SentNotification {
  id: number
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  category: 'academic' | 'system' | 'social' | 'administrative'
  sentAt: string
  sentBy: string
  recipients: {
    total: number
    read: number
    unread: number
    roles?: string[]
    specific?: string[]
  }
  status: 'sent' | 'scheduled' | 'draft' | 'failed'
  scheduledFor?: string
  priority: 'low' | 'medium' | 'high'
}

export default function SentNotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'sent' | 'scheduled' | 'draft' | 'failed'>('all')

  // Verificar permissões
  useEffect(() => {
    if (!user || user.role === 'student') {
      router.push('/notifications')
      return
    }
  }, [user, router])

  // Carregar notificações enviadas
  useEffect(() => {
    const loadSentNotifications = async () => {
      try {
        setLoading(true)
        // Simular delay de API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Mock data - em produção viria do backend
        const mockSentNotifications: SentNotification[] = [
          {
            id: 1,
            title: 'Reunião de Coordenação',
            message: 'Reunião marcada para discutir o planejamento do próximo semestre',
            type: 'info',
            category: 'administrative',
            sentAt: '2024-01-15T10:30:00',
            sentBy: user?.name || 'Usuário',
            recipients: {
              total: 15,
              read: 12,
              unread: 3,
              roles: ['teacher']
            },
            status: 'sent',
            priority: 'high'
          },
          {
            id: 2,
            title: 'Nova Atividade de Matemática',
            message: 'Atividade sobre álgebra linear disponível na plataforma',
            type: 'success',
            category: 'academic',
            sentAt: '2024-01-14T14:20:00',
            sentBy: user?.name || 'Usuário',
            recipients: {
              total: 30,
              read: 25,
              unread: 5,
              roles: ['student']
            },
            status: 'sent',
            priority: 'medium'
          },
          {
            id: 3,
            title: 'Manutenção do Sistema',
            message: 'Sistema ficará indisponível no domingo das 2h às 6h',
            type: 'warning',
            category: 'system',
            sentAt: '2024-01-13T16:45:00',
            sentBy: user?.name || 'Usuário',
            recipients: {
              total: 50,
              read: 45,
              unread: 5,
              roles: ['teacher', 'student']
            },
            status: 'sent',
            priority: 'high'
          },
          {
            id: 4,
            title: 'Aviso sobre Provas',
            message: 'Cronograma de provas do mês de fevereiro',
            type: 'info',
            category: 'academic',
            sentAt: '',
            sentBy: user?.name || 'Usuário',
            recipients: {
              total: 25,
              read: 0,
              unread: 0,
              roles: ['student']
            },
            status: 'scheduled',
            scheduledFor: '2024-01-20T08:00:00',
            priority: 'medium'
          },
          {
            id: 5,
            title: 'Rascunho - Evento Cultural',
            message: 'Convite para participar do evento cultural da escola',
            type: 'info',
            category: 'social',
            sentAt: '',
            sentBy: user?.name || 'Usuário',
            recipients: {
              total: 0,
              read: 0,
              unread: 0
            },
            status: 'draft',
            priority: 'low'
          }
        ]
        
        setSentNotifications(mockSentNotifications)
      } catch (error) {
        console.error('Erro ao carregar notificações enviadas:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user && user.role !== 'student') {
      loadSentNotifications()
    }
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  if (!user || user.role === 'student') {
    return null
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
              <h1 className="text-2xl font-bold text-gray-900">Notificações Enviadas</h1>
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
                        <h3 className="text-lg font-medium text-gray-900">
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">
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
      </div>
    </div>
  )
}